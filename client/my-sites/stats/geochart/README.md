Stats Geochart
==============
This component creates the geochart used in the Countries module.  It utilizes the [geo chart](https://developers.google.com/chart/interactive/docs/gallery/geochart) provided by Google.

#### How to use:

```js
import GeoChart from 'my-sites/stats/geochart';

const MyComponent = () => {
    return (
  		<GeoChart query={ <Object> } />
    );
};
```

#### Required Props

* `query`: A query object used as a prop for `QuerySiteStats` component
