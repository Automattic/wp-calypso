# Ensure JSX className adheres to CSS namespace guidelines

If JSX element includes `className`, it must follow the [Block-Element-Modifier](https://en.bem.info/methodology/naming-convention/) naming principle.

## Rule Details

The following patterns are considered warnings:

```jsx
// client/sample-component/index.js
export function myComponent1() {
	return <div className="sampleVisibleDiv" />;
}

// client/another-sample/index.js
export function myComponent2() {
	return (
		<div className="another-sample">
			<div className="another-sample-child" />
		</div>
	);
}
```

The following patterns are not warnings:

```jsx
// client/sample-component/index.js
export function myComponent1() {
	return <div className="sample__visible" />;
}

// client/another-sample/index.js
export function myComponent2() {
	return (
		<div className="another-sample">
			<div className="another-sample__child" />
		</div>
	);
}
```
