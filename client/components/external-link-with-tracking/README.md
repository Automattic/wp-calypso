# ExternalLinkWithTracking

External Link with Tracking is a React component for rendering an external link that is connected to the Redux store
and is capable of recording Tracks events.

## Usage

```jsx
import { ExternalLinkWithTracking } from 'calypso/components/external-link-with-tracking';

function MyComponent() {
	return (
		<ExternalLinkWithTracking
			icon
			href="https://wordpress.org"
			onClick={ () => {} }
			tracksEventName="tracks_event_name"
			tracksEventProps={ { foo: 'baz' } }
			recordTracksEvent={ ( tracksEventName, tracksEventProps ) => {} }
		>
			WordPress.org
		</ExternalLinkWithTracking>
	);
}
```

## Props

The following props are passed down to the underlying `ExternalLink` component from `@automattic/components`:

| property      | type    | required | comment                                                                        |
| ------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `icon`        | Boolean | no       | Set to true if you want to render a nice external Gridicon at the end of link. |
| `localizeUrl` | Boolean | no       | Set to false if you want to render a link that is not localized.               |

Any other props that you pass into the `a` tag will be rendered as expected.
For example `onClick` and `href`.

See `ExternalLink` component from `@automattic/components` for more info.

In addition, you can pass the following Tracks-related props to the `<ExternalLinkWithTracking />` component:

| property            | type   | required | comment                                                                   |
| ------------------- | ------ | -------- | ------------------------------------------------------------------------- |
| `tracksEventName`   | string | yes      | Tracks event name                                                         |
| `tracksEventProps`  | object | no       | Additional parameters that can be tracked along with the event            |
| `recordTracksEvent` | object | no       | Optional callback for recording the event, accepting the above properties |
