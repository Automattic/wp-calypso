Viewport
========

Viewport is a module for responding to changes in the browser viewport size. It registers its own [data module](https://github.com/WordPress/gutenberg/tree/master/data), updated in response to browser media queries on a standard set of supported breakpoints. This data and the included higher-order components can be used in your own modules and components to implement viewport-dependent behaviors.

## Breakpoints

The standard set of breakpoint thresholds is as follows:

Name|Pixel Width
---|---
`huge`|1440
`wide`|1280
`large`|960
`medium`|782
`small`|600
`mobile`|480

## Data Module

The Viewport module registers itself under the `core/viewport` data namespace.

```js
const isSmall = select( 'core/viewport' ).isViewportMatch( '< medium' );
```

The `isViewportMatch` selector accepts a single string argument `query`. It consists of an optional operator and breakpoint name, separated with a space. The operator can be `<` or `>=`, defaulting to `>=`.

```js
const { isViewportMatch } = select( 'core/viewport' );
const isSmall = isViewportMatch( '< medium' );
const isWideOrHuge = isViewportMatch( '>= wide' );
// Equivalent: 
//  const isWideOrHuge = isViewportMatch( 'wide' );
```

## `ifViewportMatches` Higher-Order Component

If you are authoring a component which should only be shown under a specific viewport condition, you can leverage the `ifViewportMatches` higher-order component to achieve this requirement.

Pass a viewport query to render the component only when the query is matched:

```jsx
function MyMobileComponent() {
	return <div>I'm only rendered on mobile viewports!</div>;
}

MyMobileComponent = ifViewportMatches( '< small' )( MyMobileComponent );
```

## `withViewportMatch` Higher-Order Component

If you are authoring a component which should vary its rendering behavior depending upon the matching viewport, you can leverage the `withViewportMatch` higher-order component to achieve this requirement.

Pass an object, where each key is a prop name and its value a viewport query. The component will be rendered with your prop(s) assigned with the result(s) of the query match:

```jsx
function MyComponent( { isMobile } ) {
	return (
		<div>Currently: { isMobile ? 'Mobile' : 'Not Mobile' }</div>
	);
}

MyComponent = withViewportMatch( { isMobile: '< small' } )( MyComponent );
```
