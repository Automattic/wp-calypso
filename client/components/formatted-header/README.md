FormattedHeader (JSX)
=====================

This component displays a header and optional sub-header.

When the `compactOnMobile` flag is set, the header renders in a compact way on smaller screen sizes.

#### How to use:

```js
import FormattedHeader from 'components/formatted-header';

render() {
	return (
		<FormattedHeader
			headerText="A main title"
			subHeaderText="A main title"
		/>
	);
}
```

#### Props

* `id` (`string`) - ID for the header (optional)
* `headerText` (`string`) - The main header text
* `subHeaderText` (`node`) - Sub header text (optional)
* `compactOnMobile` (`bool`) - Display a compact header on small screens (optional)
* `isSecondary` (`bool`) - Use the H2 element instead of the H1 (optional)
