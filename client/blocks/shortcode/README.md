# Shortcode

Shortcode is a React component enabling sandboxed rendering of a shortcode string. It leverages the WordPress.com REST API `GET /sites/%s/shortcodes/render` endpoint, writing the rendered shortcode contents, scripts, and styles to an `<iframe />` element. Using an `<iframe />` element for rendering prevents script conflicts and facilitates cleanup.

**NOTE:** While it is considered safe to use the `<Shortcode />` component to render shortcodes for Jetpack sites, keep in mind that these sites are user-controlled, so arbitrary script execution can occur. The scripts execute in a sandboxed, cookieless, unprivileged domain, so there is no risk of exposing sensitive user information. Also consider that any scripts sourced from Jetpack sites may be subject to mixed content warnings unless the site runs under HTTPS. A common workaround here is to use the `filterRenderResult` to source equivalent scripts from WordPress.com, which supports serving under HTTPS.

## Usage

Simply pass a site ID and a shortcode string child. The component will automatically trigger a network request to retrieve the rendered shortcode.

```jsx
import React from 'react';
import Shortcode from 'calypso/blocks/shortcode';

export default class extends React.Component {
	static displayName = 'MyComponent';

	render() {
		return <Shortcode siteId={ 6393289 }>[gallery ids="31860,31856"]</Shortcode>;
	}
}
```

## Props

The following props can be passed to the Shortcode component. Any additional props will be applied to the rendered `iframe` element.

| property             | type     | required | default                | comment                                                                                                                                                                                                                                                      |
| -------------------- | -------- | -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `siteId`             | Number   | yes      |                        | The site ID for which to render the shortcode.                                                                                                                                                                                                               |
| `children`           | String   | yes      |                        | The shortcode to render.                                                                                                                                                                                                                                     |
| `filterRenderResult` | Function | no       | `( result ) => result` | Function to override default render result. Passed the original result of the [shortcode render endpoint](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/shortcodes/render/) response, the function is expected to return a modified result. |
| `allowSameOrigin`    | Boolean  | no       | `false`                | Whether or not to set `allow-same-origin` on rendered 'iframe' `sandbox` attribute                                                                                                                                                                           |

## Resources

You may find it convenient to use the [`Shortcode` conversion library](https://github.com/Automattic/wp-calypso/tree/HEAD/client/lib/shortcode) in conjunction with this component to help with generating shortcode strings.
