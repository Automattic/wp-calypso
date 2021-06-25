# Root Child

Root Child is a React component which will render its children as descendants
of the root `<body>` element. This is handy in cases where you want to fix
an element to the bounds of the page, without worrying that an ancestor
positioning may impact the child's style.

## Usage

```jsx
import React from 'react';
import { RootChild } from '@automattic/components';

export default class extends React.Component {
	render() {
		return (
			<div className="my-component">
				<span>This text will be a child of MyComponent</span>
				<RootChild>
					<span>This text will be a child of the root element, not of MyComponent</span>
				</RootChild>
			</div>
		);
	}
}
```

## Notes

The `<RootChild />` children are wrapped in a single `<div />` element, so they are not truly
direct descendants of the `<body>` element.
