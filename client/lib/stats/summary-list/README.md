StatsDataSummaryList
====================
The `StatsDataSummaryList` powers the data viewed in `/client/manage/stats.jsx`.

The package acts as a collection of `StatsDataSummary` objects.

### create instance
To work with the `StatsDataSummaryList` collection, you need to pass in a config object with the following *required* attributes:

`{ siteIds: [array of site ids], period: 'days/weeks/months/year', date: 'YYYY-MM-DD representation of end date of period' }`

Methods
=======
### get( siteId )
Retrieve the `StatsDataSummary` for a given `siteId`.  Returns false if no site exists in collection.

### updatePeriod( { period: '', date: '' } )
This method handles switching of the time period context.  Triggers and update of all collection model objects.