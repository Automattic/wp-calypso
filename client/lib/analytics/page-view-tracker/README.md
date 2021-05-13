# Page View Tracking Component

Use this component to automatically record page views when they are loaded and when the `path` changes.

There are two modes of operation: immediate and delayed. In the immediate mode, the page view tracking event will fire off as soon as the component mounts. In the delayed mode, the event will fire off no sooner than the given delay, and will not send at all if the component unmounts before that delay has expired.

This component is aware of the selected site and, if the current URL contains a site fragment, it will delay the page view recording until the selected site is set or updated.

## Props

- `delay`: time in millisecods to delay the recording of the page view event.
- `path`: required `String` that represents the path to report as the source of the page view event. It should follow Calypso's [Path Conventions](https://github.com/Automattic/wp-calypso/blob/HEAD/client/lib/analytics/docs/page-views.md#paths-conventions).
- `title`: required `String` that represent the page's title. It should follow Calypso's [Title Conventions](https://github.com/Automattic/wp-calypso/blob/HEAD/client/lib/analytics/docs/page-views.md#titles-conventions).
- `properties`: optional `Object` with aditional properties that correspond to IDs or variables present on the `path`.

## Examples

### Immediate Page View Tracking

```js
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';

function render() {
	return (
		<Main>
			<PageViewTracker path="/section/page" title="My Cool Section > My Cool Page" />
			<MyCoolComponent>
				<MyCoolChildren />
			</MyCoolComponent>
		</Main>
	);
}
```

### Delayed Page View Tracking

```js
import PageViewTracker from 'analytics/page-view-tracker';

function render() {
	// consider a view for less than 500ms as an
	// accidental view and thus don't track

	return (
		<Main>
			<PageViewTracker delay={ 500 } path="/section/page" title="My Cool Section > My Cool Page" />
			<MyCoolComponent>
				<MyCoolChildren />
			</MyCoolComponent>
		</Main>
	);
}
```

### Reporting Variables

```js
import PageViewTracker from 'analytics/page-view-tracker';

function render() {
	const { postId, postTitle } = this.props;

	return (
		<Main>
			<PageViewTracker
				path="/comments/all/:site/:post_id"
				title={ `Comments > ${ postTitle }` }
				properties={ { post_id: postId } }
			/>
			<MyCoolComponent>
				<MyCoolChildren />
			</MyCoolComponent>
		</Main>
	);
}
```
