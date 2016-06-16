# Ensure JSX className adheres to CSS namespace guidelines

If JSX element includes `className`, it must include the containing directory name as the component name for the root element, or as a component prefix for child elements (with `__` separating component and element names).

[See Calypso CSS guidelines for more information](https://github.com/Automattic/wp-calypso/blob/master/docs/coding-guidelines/css.md)

## Rule Details

The following patterns are considered warnings:

```js
// client/sample-component/index.js
export default function() {
	return <div className="sample" />;
}

// client/another-sample/index.js
export default function() {
	return (
		<div className="another-sample">
			<div className="another-sample-child" />
		</div>
	);
}
```

The following patterns are not warnings:

```js
// client/sample-component/index.js
export default function() {
	return <div className="sample-component" />;
}

// client/another-sample/index.js
export default function() {
	return (
		<div className="another-sample">
			<div className="another-sample__child" />
		</div>
	);
}
```
