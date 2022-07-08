# Simple API Response

The Response Class helps to model the structure of the API JSON Response.

Benefits:
* Simplifies and keeps the codes in controller more concise
* Standardize the API Response structure
* Methods to help further structure the Response data, helps to further improve the QOL in writing the models for the each API.

***

## Constructor

The constructors takes in 4 Parameters:

### Constructor Parameters

| Parameter |    Data Type    |                Description               | Require | Default |
|:---------:|:---------------:|:----------------------------------------:|:-------:|:-------:|
|    data   | Array \| Object |      Data to be written for response     |   Yes   |         |
|  success  |     Boolean     | Indicates if the API call was successful |    No   |   True  |
|   status  |      Number     |             HTTP Status Code             |    No   |   200   |
|  options  |      Object     |     Options for Response Constructor     |    No   |    {}   |

### Constructor Options
|   Options   | Data Type |                               Description                             | Require |               Default               |
|:-----------:|:---------:|:---------------------------------------------------------------------:|:-------:|:-----------------------------------:|
| updatedTime |    Date   |               The last updated time of this API response              |    No   |                                     |
|    error    |   Object  | Error object for failed API call,  consists of error code and message |    No   | {code:0, message: "Unknown Error."} |
|   paginate  |  Boolean  |          Indicates if the API response data will be paginated         |    No   |                false                |


***

## Methods

The methods provided in the Response class allows method chaining. However, the behaviors of the chained methods differ between each methods.

### displayLimit([limitSize = -1])

The displayLimit method sets the display limit of data per API request or per page (if paginated).

**Argument(s)**
[limitSize = 1] (Number): The number of array element displays per request. If sets to -1, the limit is disabled.

**Method Chaining**
The limitSize of the latest chain displayLimit will be set as the display limit, all the limit set prior will be ignored.


### page(pageNumber, [baseURI = ""])

The page method sets the page number of the response data (if paginated).

**Argument(s)**
pageNumber (Number): Page number of the paginated data.
[baseURI = ""] (String): Page URI, to include ?? to indicate previous / next page number

**Method Chaining**
The pageNumber and baseURI of the latest chain page will be used, all the method called prior will be ignored.


### limitField([startIndex = 0], [endIndex = this.data.length])

The limitField method sets the limit for the field of response data. This will modify the data parsed into the Response object

**Argument(s)**
[startIndex = 0] (Number): Starting zero-based index of field limit (inclusive)
[endIndex = this.data.length] (Number): Ending zero-based index of field limit (non-inclusive)

**Method Chaining**
Method chaining will overlap and stack atop each other in the limitation of field.


## API Response Model

The response object will be modelled with the following structure:

* success (Boolean)
* status (Number)
* updatedTime? (String)
* results (Object)
    * count (Number)
    * outOfRange (Boolean)
    * pagination (Object)
        * paginated (Boolean)
        * totalPages (Number)
        * page (Number)
    * displayLimit (Number)
    * previousPage? (Object)
        * page? (Number)
        * count? (Number)
        * uri? (String)
    * nextPage? (Object)
        * page? (Number)
        * count? (Number)
        * uri? (String)
* data (Object | Array)
