Stats Overview
====================
This component creates Stats Overview which is what renders each site section on www.wordpress.com/stats when a user has more than 1 site.


#### How to use:

```js
var StatsOverview = require( 'my-sites/stats/overview' );

render: function() {
    return (
  		<StatsOverview site={ <Object> } summaryData={ <StatsList Object> path={ <String> } } />
    );
}
```

#### Required Props

* `site`: A Site Object
* `summaryData`: Is an instance of a StatsList that would hold a repsonse from the /site/<siteID>/stats/visits endpoint
* `path`: String used to build out the various links to the site