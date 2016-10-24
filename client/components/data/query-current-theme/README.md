Query Current Theme
===================

Use this component anywhere where you need the currently active theme for a site. It fetches data when necessary, and renders nothing.

## Usage

```jsx
<div>
	<QueryCurrentTheme siteID={ site.ID }/>
</div>
```

The current theme will be available from the global app state via the `getCurrentTheme()` [selector](/client/state/themes/current-theme/selectors.js).

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which the current theme should be queried.
