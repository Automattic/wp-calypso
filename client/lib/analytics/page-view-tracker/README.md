# Page View Tracking Component

Use this component to automatically record page views when they are loaded and when the `path` changes.

There are two modes of operation: immediate and delayed. In the immediate mode, the page view tracking event will fire off as soon as the component mounts. In the delayed mode, the event will fire off no sooner than the given delay, and will not send at all if the component unmounts before that delay has expired.

This component is aware of the selected site and, if the current URL contains a site fragment, it will delay the page view recording until the selected site is set or updated.

## Examples

### Immediate Page View Tracking

```js
import PageViewTracker from 'lib/analytics/page-view-tracker';

render() {
	return (
		<Main>
			<PageViewTracker path="/section/page" title="My Cool Section > My Cool Page" />
			<MyCoolComponent>
				<MyCoolChildren />
			</MyCoolComponent>
		</Main>
	);
);
```

### Delayed Page View Tracking

```js
import PageViewTracker from 'analytics/page-view-tracker';

render() {
	// consider a view for less than 500ms as an
	// accidental view and thus don't track

	return (
		<Main>
			<PageViewTracker 
				delay={ 500 } 
				path="/section/page"
				title="My Cool Section > My Cool Page"
			/>
			<MyCoolComponent>
				<MyCoolChildren />
			</MyCoolComponent>
		</Main>
	);
);
```
