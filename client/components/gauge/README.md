Gauge
======

This component renders a simple gauge using a `<canvas/>` element that shows a percentage visually.

#### How to use:

```js
var Gauge = require( 'components/gauge' );

render: function() {
    return (
  		<Gauge percentage={ 40 } metric={ 'Visits' } />
    );
}
```

#### Required Props

* `percentage`: a numeric percentage between 0-100.

#### Optional Props

The following props may also be used.  Default values are shown inside [].

* `width`: [ 100 ] numeric width of canvas
* `height`: [ 100 ] numeric height of canvas
* `lineWidth`: [ 14 ] numeric width of arc stroke in the canvas
* `labelSize`: [ 20 ] numeric size used for `px` of the label
* `colors`: [ '#c8d7e1', '#004069' ] array of colors used for the arcs. First value is the background color, second value is used to show percentage
* `metric`: text label for the numerical value above it
