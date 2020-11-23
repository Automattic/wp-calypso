# ScreenReaderText (JSX)

ScreenReaderText is a component that is invisible on screen, but read out to screen readers. Use this to add context to inputs, buttons, or sections that might be obvious from visual cues but not to a screen reader user.

This idea was pulled from WordPress core, for more background & technical details, see [Hiding text for screen readers with WordPress Core](https://make.wordpress.org/accessibility/2015/02/09/hiding-text-for-screen-readers-with-wordpress-core/)

---

## How to use

```js
import { Button, ScreenReaderText } from '@automattic/components';
import Gridicon from 'calypso/components/gridicons';

function ScreenReaderTextExample() {
	return (
		<Button>
			<Gridicon icon="cross" />
			<ScreenReaderText>{ translate( 'Close' ) }</ScreenReaderText>
		</Button>
	);
}
```
