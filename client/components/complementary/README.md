Complementary (jsx)
==========

Component used to declare a complementary region in the application as per [the WAI-ARIA 1.1 recommendation](https://www.w3.org/TR/wai-aria/#complementary):

> A supporting section of the document, designed to be complementary to the main content at a similar level in the DOM hierarchy, but remains meaningful when separated from the main content.

#### How to use:

```js
import Complementary from 'components/complementary';

render() {
	return (
		<Complementary (optional) className="your-component">
			Your section content...
		</Complementary>
	);
}
```

#### Props

* `className`: Add your own class to the wrapper.
