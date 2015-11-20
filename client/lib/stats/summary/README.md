StatsDataSummary
=====================
Is instantiated by `StatsSummaryList` for each siteId passed in the intial config.  It can also be created stand-alone by passing in the following arguments:

`new StatsDataSummary( { siteId: (int), period: (string), date: (string) } );` 

External Dependencies
=====================
* `store.js` to interact with LocalStorage
* `EventEmitter` to send `change` events which are subscribed to via the `mixins\data-observe` within your jsx component.

Internal Dependencies
=====================
* `wpcom-undocumented` to fetch data from the `/stats/summary/{ site.ID }` endpoint

Methods
=======
### fetch
Calls `\sites\{site.ID}\stats\summary` via `wpcom-undocumented`

### fetchPeriod ( { period: (string), date: (string) } )
Attempts to find associated data for date/period combination in local storage, otherwise calls `fetch()`.

### findInLocalStorage
Looks for a matching record in local storage, if found, returns the record to `this.data` and if the record is older than 10 minutes, requests a refresh via `fetch()`.

### saveToLocalStorage
Persists unique date/period combination to local storage.  Ensures only 10 records are ever stored for a given siteID.
