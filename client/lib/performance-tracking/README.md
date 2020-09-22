# Performance Tracking

This lib provides wrappers around `@automattic/browser-data-collector`

## Start

### Generic function

It provides a function `startPerformanceTracking()` that accepts the name of the page being tracked and a flag for full page loads. It is a simple
wrapper around the `start` method in `@automattic/browser-data-collector` with an additional check to validate that the performance tracking is
enabled for this environment (by checking the feature flag `rum-tracking/logstash`).

Unless there is a specialized wrapper (eg: middleware `performanceTrackerStart`), using this function is the recommended approach to track performance
of loading pages in Calypso.

### Middleware

It provides a middleware expected to be used with Page router.

Example:

```jsx
page( '/my-page/*', performanceTrackerStart( 'my-page' ) /*...*/ );
```

The id provided to `performanceTrackerStart` must match the id provided by the hook `usePerformanceTrackerStop`, which equals to the name of the section
loaded. It will also pass the option `{fullPageLoad: true}` to `@automattic/browser-data-collector` if the route hit comes from a full page load.

## Stop

### Generic function

The counterpart of the generic start function.

### Hook

A hook `usePerformanceTrackerStop`. This is custom hook uses `useEffect` to stop a performance tracking.

Example:

```jsx
function MyComponent() {
	usePerformanceTrackerStop();
	return <div>Content</div>;
}
```

It will also get the current section name from the Redux store and use it as the `id` of the performance tracker report to stop.

This is the recommended approach when using function components and rendering that component _always_ means the page is ready and you want to stop the tracking. If the component
can render different states (eg: loading vs main content), then you should use `<PerformanceTrackerStop/>` as part of the "main" state output.

### Component

A component `PerformanceTrackerStop`. This is a wrapper around the above hook.

Example:

```jsx
function MyComponent( { isLoading } ) {
	if ( isLoading ) return <Loading />;

	return (
		<>
			<div>Content</div>
			<PerformanceTrackerStop />
		</>
	);
}
```

Using this component is the recommended approach when the parent component can render different states and we only want to stop the performance tracking in one of them.

### High Order Component

A HoC `withPerformanceTrackerStop` that will automatically append `<PerformanceTrackerStop/>` to the wrapped component.

Example:

```jsx
class MyComponent extends React.Component {
	//...
}
export default withPerformanceTrackerStop( MyComponent );
```

This is the recommended approach when using class components. Similar to `usePerformanceTrackerStop` hook, it assumes that the wrapped component only renders the content of the page we want to
measure, and not any other state (eg: loading content). In that case, please use `<PerformanceTrackerStop/>` as part of the "main" state output.
