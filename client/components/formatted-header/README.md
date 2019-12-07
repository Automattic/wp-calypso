FormattedHeader (JSX)
=====================

This component displays a header and optional sub-header.

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
