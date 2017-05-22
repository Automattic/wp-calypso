StepHeader (JSX)
================

This component displays a header and optional sub-header.

#### How to use:

```js
import StepHeader from 'blocks/step-header';

render() {
	return (
		<StepHeader
			headerText="A main title"
			subHeaderText="A main title"
		/>
	);
}
```

#### Props

* `headerText` (`string`) - The main header text
* `subHeaderText` (`node`) - Sub header text (optional)
