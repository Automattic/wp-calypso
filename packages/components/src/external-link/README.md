# External Link

## ExternalLink

External Link is a React component for rendering an external link.

### Usage

```jsx
import { ExternalLink } from '@automattic/components';

function MyComponent() {
	return (
		<ExternalLink icon href="https://wordpress.org" onClick={ () => {} }>
			WordPress.org
		</ExternalLink>
	);
}
```

### Props

The following props can be passed to the External Link component:

| property      | type    | required | comment                                                                        |
| ------------- | ------- | -------- | ------------------------------------------------------------------------------ |
| `icon`        | Boolean | no       | Set to true if you want to render a nice external Gridicon at the end of link. |
| `localizeUrl` | Boolean | no       | Set to false if you want to render a link that is not localized.               |

### Other Props

Any other props that you pass into the `a` tag will be rendered as expected.
For example `onClick` and `href`.