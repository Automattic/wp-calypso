Stats Geochart
================
This component creates the geochart used in the Countries module.  It utilizes the [geo chart](https://developers.google.com/chart/interactive/docs/gallery/geochart) provided by Google.

#### How to use:

```js
var GeoChart = require( 'my-sites/stats/geochart' );

render: function() {
    return (
  		<GeoChart data={ <Array> } dataList={ <StatsList Object> } />
    );
}
```

#### Required Props

* `data`: An array of country data using the format [specified](https://developers.google.com/chart/interactive/docs/gallery/geochart#Data_Format) by the Google geo chart
* `dataList`: Is an instance of a StatsList that would likely hold a repsonse from the /site/<siteID>/stats/country-views endpoint