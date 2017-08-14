Extension Redirect
==================

`<ExtensionRedirect />` is a React component that conditionally redirects a user from an
extension page to the corresponding plugin installation page, if the corresponding plugin
isn't installed on the given site.

## Usage

Render the component, passing `siteId` and `pluginId`. It does not accept any children, nor does it render any elements to the page. Use it near the top level of your extension page.

## Props

### `pluginId`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The ID of the plugin for which to check.

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The ID of the site on which to check whether the plugin is installed.
