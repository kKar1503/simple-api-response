const _ = require("lodash");

/**
 * @const {Object} DEFAULT_RESULTS Default results object for the response data
 */
const DEFAULT_RESULTS = {
	count: 0,
	outOfRange: false,
	pagination: {
		paginated: false,
		totalPages: 0,
		page: 0,
	},
	displayLimit: -1,
};

/**
 * This is a module to model the response objet using class constructor.
 * @module Response
 */

/**
 * Class of Response object
 */
module.exports = class Response {
	/**
	 * @property {Number} page Page number if the response is paginated
	 * @private
	 */
	#page = 0;

	/**
	 * @property {Number} limit Sets the limit of response data, -1 removes limit
	 * @private
	 */
	#limit = -1;

	/**
	 * @property {Array} fullData Stores the original full response data
	 * @private
	 */
	#fullData = [];

	/**
	 * @property {String} baseURI Stores base URI
	 * @private
	 */
	#baseURI = "";

	/**
	 * Creates the Response object
	 * @param {Array|Object} data Data object for the API response
	 * @param {Boolean} [success=true] Indicates if the API response is successful.
	 * @param {Number} [status=200] HTTP Status Code.
	 * @param {Object} [options] Additional options to include in response object
	 * @param {Date} options.updatedTime The API information is last updated at this time
	 * @param {Object} options.error Error object to accompany the API should there's a failure
	 * @param {Number} options.error.code Error code number
	 * @param {String} options.error.message Error message
	 * @param {Boolean} options.paginate Sets if the Response will be paginated
	 */
	constructor(data, success = true, status = 200, options = {}) {
		this.success = success;
		this.status = status;
		if (options.updatedTime)
			this.updatedTime = options.updatedTime.toJSON();
		this.results = _.cloneDeep(DEFAULT_RESULTS);
		if (data) this.results.count = Array.isArray(data) ? data.length : 1;
		this.data = _.cloneDeep(data);
		if (Array.isArray(data)) this.#fullData = _.cloneDeep(data);
		if (!success)
			this.error = { ...options.error } || {
				code: 0,
				message: "Unknown Error.",
			};
		if (options.paginate) {
			this.#page = 1;
			this.results.pagination = {
				paginated: true,
				totalPages: 1,
				page: 1,
			};
		}

		this.#developmentLogging("constructor");
	}

	/**
	 * Method to set the display limit of data per API request or per page (if paginated)
	 * @property {Function} displayLimit Sets the display limit of data
	 * @param {Number} limitSize Display limit
	 * @returns {Response} Returns this object instance
	 */
	displayLimit(limitSize = -1) {
		if (!Array.isArray(this.#fullData)) {
			throw new Error("Data is not Array.");
		}
		if (!limitSize || (limitSize < 0 && limitSize !== -1)) {
			console.log("here");
			throw new Error("Limit size can only be positive number or -1.");
		}
		this.#limit = limitSize;
		this.data = this.#refreshData();

		this.#developmentLogging("displayLimit");

		return this;
	}

	/**
	 * Method to set the page number of the response data (if paginated)
	 * @property {Function} page Sets the page number
	 * @param {Number} pageNumber Page number
	 * @param {String} [baseURI] Page URI, to include ?? to indicate previous / next page number
	 * @returns {Response} Returns this object instance
	 */
	page(pageNumber, baseURI = "") {
		if (!Array.isArray(this.#fullData)) {
			throw new Error("Data is not Array.");
		}
		if (!this.#page) {
			throw new Error("API is not set to paginated.");
		}
		if (pageNumber < 1) {
			throw new Error("Page number must be a positive number.");
		}
		if (baseURI && !baseURI.includes("??")) {
			throw new Error(
				"The parsed URI must contain ?? to indicate page number location."
			);
		}

		this.#page = pageNumber;
		this.#baseURI = baseURI;
		this.data = this.#refreshData();

		this.#developmentLogging("page");

		return this;
	}

	/**
	 * Method to set the field of data
	 * @property {Function} limitField Sets the field limit of the data
	 * @param {Number} [startIndex] Starting zero-based index of field limit (inclusive)
	 * @param {Number} [endIndex] Ending zero-based index of field limit (non-inclusive)
	 * @returns {Response} Returns this object instance
	 */
	limitField(startIndex = 0, endIndex = this.#fullData.length) {
		if (!Array.isArray(this.#fullData)) {
			throw new Error(
				"Method limitField only applicable to array response data."
			);
		}

		this.#fullData = this.#fullData.slice(startIndex, endIndex);

		this.data = this.#refreshData();

		this.#developmentLogging("limitField");

		return this;
	}

	/**
	 * Private method to refresh data
	 * @property {Function} refreshData Refresh data
	 * @returns {Object} Returns data object
	 * @private
	 */
	#refreshData() {
		this.results = _.merge(
			_.pick(this.results, [
				"count",
				"outOfRange",
				"pagination",
				"limit",
			]),
			_.omit(DEFAULT_RESULTS, "pagination")
		);

		this.#developmentLogging(null, "Results reset");

		this.results.displayLimit = this.#limit;

		if (!this.#page) {
			if (this.#limit === -1) {
				this.results.count = this.#fullData.length;
				return this.#fullData;
			}
			this.results.count = this.#limit;
			return this.#fullData.slice(0, this.#limit);
		}

		this.results.pagination.page = this.#page;

		if (this.#limit === -1) {
			if (this.#page === 1) {
				this.results.count = this.#fullData.length;
				return this.#fullData;
			}
			this.results.count = 0;
			this.results.outOfRange = true;
			return [];
		}

		this.results.pagination.totalPages = Math.ceil(
			this.#fullData.length / this.#limit
		);

		const startIndex = (this.#page - 1) * this.#limit;
		const endIndex = this.#page * this.#limit;
		this.results.count = this.#fullData.length;

		if (this.#page > this.results.pagination.totalPages) {
			this.results.outOfRange = true;
			return [];
		}

		if (startIndex > 0) {
			this.results.previousPage = {
				page: this.#page - 1,
				count: this.#limit,
			};
			if (this.#baseURI) {
				this.results.previousPage.uri = `${this.#baseURI.replace(
					"??",
					this.#page - 1
				)}`;
			}
		}

		if (this.#page < this.results.pagination.totalPages) {
			this.results.nextPage = {
				page: this.#page + 1,
				count:
					this.#fullData.length - endIndex > this.#limit
						? this.#limit
						: this.#fullData.length - endIndex,
			};
			if (this.#baseURI) {
				this.results.nextPage.uri = `${this.#baseURI.replace(
					"??",
					this.#page + 1
				)}`;
			}
		}

		return this.#fullData.slice(startIndex, endIndex);
	}

	/**
	 * Private method to log developmental data to trace object instance
	 * @property {Function} developmentLogging Logs developmental data
	 * @param {String} method Method used for the log statement
	 * @param {String} [action] Action used for the log statement
	 * @private
	 */
	#developmentLogging(method, action = "") {
		if (process.env.NODE_ENV === "development") {
			console.log(
				`Event: ${action ? `Action - ${action}` : `Method - ${method}`}`
			);
			console.log(this);
		}
	}
};
