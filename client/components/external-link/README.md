External Link
=======

External Link is a React component for rendering an external link.

## Usage

```jsx

import React from 'react';
import ExternalLink from 'components/external-link';

class MyComponent extends React.Component {
	render() {
		return <ExternalLink icon={ true } href="https://wordpress.org" onClick="somefunction()">WordPress.org</ExternalLink>;
	}
}
```

## Props
The following props can be passed to the External Link component:

| property | type    | required | comment |
| -------- | ------- | -------- | ------- |
| `icon`   | Boolean | no       | Set to true if you want to render a nice external Gridicon at the end of link. |

## Other Props
Any other props that you pass into the `a` tag will be rendered as expected.
For example `onClick` and `href`.
