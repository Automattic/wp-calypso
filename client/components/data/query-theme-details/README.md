QueryThemeDetails
=================

A component to decouple the fetching of a theme's details from any rendering.

Use this component anywhere where you need full details for a particular theme.
It fetches data when necessary, and renders nothing.

## Usage

```jsx
<div>
	<QueryThemeDetails id={ themeId }/>
</div>
```

Theme details data will be available from the global app state via the `getThemeDetails()` [selector](/client/state/themes/theme-details/selectors.js).

## Props

### `id`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The theme ID for which theme details should be queried.
