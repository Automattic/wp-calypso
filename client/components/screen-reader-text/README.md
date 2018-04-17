ScreenReaderText (JSX)
====================

ScreenReaderText is a component that is invisible on normal displays but "visible" to screen readers.

-------

#### How to use:

```js
import ScreenReaderText from 'components/screen-reader-text';

function ScreenReaderTextExample() {
	const srText = "I'm visible for screen readers";
	return (
		<div>
			<p>
				This text is followed by the JSX "&lt;ScreenReaderText&gt;{ srText }&lt;/ScreenReaderText&gt;".
				It's invisible on normal displays but "visible" to screen readers. Inspect to see the
				example.
			</p>
			<ScreenReaderText>{ srText }</ScreenReaderText>
		</div>
	);
}

```
