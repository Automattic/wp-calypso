# Ensure JSX className adheres to CSS namespace guidelines

If JSX element includes `className`, it must include the containing directory name as the component name for the root element, or as a component prefix for child elements (with `__` separating component and element names).

[See Calypso CSS guidelines for more information](https://github.com/Automattic/wp-calypso/blob/HEAD/docs/coding-guidelines/css.md)

## Rule Details

The following patterns are considered warnings:

```jsx
// client/sample-component/index.js
export function myComponent1() {
	return <div className="sample" />;
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
	return <div className="sample-component" />;
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

## Options

This rule accepts an object as its first option:

- `"rootFiles"` (default: `[ index.js, index.jsx ]`) array of filenames allowed to contain root component in each folder.

For example, you can allow `index.jsx` and `main.jsx`:

```json
{
	"jsx-classname-namespace": [
		"error",
		{
			"rootFiles": [ "index.jsx", "main.jsx" ]
		}
	]
}
```

Examples of **correct** code for this rule with `rootFiles` set to `[ 'foo.js' ]`: (watch the filename)

```jsx
/* rule config:
	jsx-classname-namespace: [ "error", { rootFiles: [ 'foo.js' ] } ]
*/
// client/sample-component/foo.js
export default function () {
	return <div className="sample" />;
}
```

Examples of **incorrect** code for this rule with `rootFiles` set to `[ 'foo.js' ]`: (watch the filename)

```jsx
/* rule config:
	jsx-classname-namespace: [ "error", { rootFiles: [ 'foo.js' ] } ]
*/
// client/sample-component/index.js
export default function () {
	return <div className="sample" />;
}
```
