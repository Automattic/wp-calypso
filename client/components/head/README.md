# Head

Provides an HTML `<head>` prefilled with boilerplate (such as `meta`s and `links` for stylesheets, favicons, etc.) that is common for all of Calypso. Accepts children which will be rendered as children of `head`.

## Usage

```jsx
import Head from 'calypso/components/head';

<Head title="Calypso">
	<meta property="myCustomMeta" content="foobar" />
	<link rel="stylesheet" href="/dev/null" />
</Head>;
```

## Props

Below is a list of supported props.

### `title`

<table>
	<tr><td>Type</td><td>String</td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>WordPress.com</code></td></tr>
</table>

The HTML page's `title`.

### `children`

<table>
	<tr><td>Type</td><td><code>PropTypes.node</code></td></tr>
	<tr><td>Required</td><td>No</td></tr>
	<tr><td>Default</td><td><code>null</code></td></tr>
</table>

Child elements to be rendered. If you want to add any additional `<meta />` or `<link />` tags, pass them here.
