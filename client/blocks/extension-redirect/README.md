# Extension Redirect

`<ExtensionRedirect />` is a React component that conditionally redirects a user from an
extension page to the corresponding plugin installation page (or a custom URL), if the
corresponding plugin isn't installed or activated on the given site, or if the required
minimum plugin version isn't met.

## Usage

Render the component, passing `siteId` and `pluginId` (and optionally, `minimumVersion` and/or `redirectUrl`). It does not accept any children, nor does it render any elements to the page. Use it near the top level of your extension page.

## Props

### `pluginId`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The ID of the plugin for which to check.

### `minimumVersion`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

An optional plugin minimum version to check for.

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The ID of the site on which to check whether the plugin is installed and activated.

### `redirectUrl`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

A custom URL to redirect to (instead of the plugin page).
