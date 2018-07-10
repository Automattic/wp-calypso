# navigateRegions

`navigateRegions` is a React [higher-order component](https://facebook.github.io/react/docs/higher-order-components.html) adding keyboard navigation to switch between the different DOM elements marked as "regions" (role="region"). These regions should be focusable (By adding a tabIndex attribute for example)

## Example:

```jsx
function MyLayout() {
	return (
		<div>
			<div role="region" tabIndex="-1">Header</div>
			<div role="region" tabIndex="-1">Content</div>
			<div role="region" tabIndex="-1">Sidebar</div>
		</div>
	);
}

export default navigateRegions( MyLayout );
```