# Dot pager

`DotPager` wraps all its child components into a browsable container that shows only one child at time.

## Usage

```js
import DotPager from '@automattic/components/src/dot-pager';

function myDotPager() {
	return (
		<DotPager>
			<div>Item 1</div>
			<div>Item 2</div>
			<div>Item 3</div>
		</DotPager>
	);
}
```
