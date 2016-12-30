Stats List
==========
The `StatsList` module aims to replace all the individual list modules that have been created in Calypso.  Essentially it distills all the other modules logic into once place, but allows 'parser' functions to manipulate the payloads prior to display.

To create an instance of a `StatsList`, you must pass in both a `siteID` and `statType` option.  `statType` is essentially the same as the endpoint name in `wpcom.js`:

```es6
var clicksList = new StatsList( { siteID: 123, statType: 'statsClicks' } );
```

Any additional options passed in are added as options to the api request so the following list would add in a `period` and `max` keys to the api call:

```es6
var clicksList = new StatsList( { siteID: 123, statType: 'statsClicks', period: 'day', max: 10 } );
```

Stats Parser
============
Functions within `stats-parser.js` are utilized to transform the data into standard arrays that are then consumed by .jsx views.


Internal Dependencies
=====================
* `wpcom-undocumented` to fetch data from the `/sites/{ site.ID }/stats/{ statType }` endpoint
* `local-list` to persist api responses to localStorage by siteID and options:w
* `emitter` mixin to send `change` events which are subscribed to within your jsx component.

Methods
=======

# fetch()
Fetches data from the API

# isEmpty()
Returns boolean value if the data set is empty or not

# isLoading()
Returns boolean value if the list is loading or not.

# isError()
Returns boolean value if there was an error loading the data or not.

Tests
=====
To run the test suite, run `make` from the root directory.