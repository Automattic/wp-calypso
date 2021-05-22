# External Link

## ExternalLink

External Link is a React component for rendering an external link.

### Usage

```jsx
import React from 'react';
import ExternalLink from 'calypso/components/external-link';

class MyComponent extends React.Component {
	render() {
		return (
			<ExternalLink icon href="https://wordpress.org" onClick={ () => {} }>
				WordPress.org
			</ExternalLink>
		);
	}
}
```

### Props

The following props can be passed to the External Link component:

| property | type    | required | comment                                                                        |
| -------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `icon`   | Boolean | no       | Set to true if you want to render a nice external Gridicon at the end of link. |

### Other Props

Any other props that you pass into the `a` tag will be rendered as expected.
For example `onClick` and `href`.

## External Link with Tracking

External Link with Tracking is a React component for rendering an external link that is connected to the Redux store
and is capable of recording Tracks events.

### Usage

```jsx
import React from 'react';
import ExternalLinkWithTracking from 'calypso/components/external-link/with-tracking';

class MyComponent extends React.Component {
	render() {
		return (
			<ExternalLinkWithTracking
				icon
				href="https://wordpress.org"
				onClick={ () => {} }
				tracksEventName="tracks_event_name"
				tracksEventProps={ { foo: 'baz' } }
			>
				WordPress.org
			</ExternalLinkWithTracking>
		);
	}
}
```

### Props

In addition to the props that the unconnected `<ExternalLink />` component accepts, you
can pass the following Tracks-related props to the `<ExternalLinkWithTracking />` component:

| property           | type   | required | comment                                                        |
| ------------------ | ------ | -------- | -------------------------------------------------------------- |
| `tracksEventName`  | string | yes      | Tracks event name                                              |
| `tracksEventProps` | object | no       | Additional parameters that can be tracked along with the event |
