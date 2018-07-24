# D3 Base Component

Integrate React Lifecyle methods with d3.js charts.

### Base Component Responsibilities

* Create and manage mounting and unmounting parent `div` and `svg`
* Handle resize events, resulting re-renders, and event listeners
* Handle re-renders as a result of new props

## Props

### className
{ string } A class to be applied to the parent `div`

### getParams( node )
{ function } A function returning an object containing required properties for drawing a chart. This object is created before re-render, making it an ideal place for calculating scales and other props or user input based properties.
* `svg` { node } The parent `div`. Useful for calculating available widths

### drawChart( svg, params )
{ function } draw the chart
* `svg` { node } Base element 
* `params` { Object } Properties created by the `getParams` function 
