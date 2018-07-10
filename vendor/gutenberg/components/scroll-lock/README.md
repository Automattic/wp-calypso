ScrollLock
==========

ScrollLock is a content-free React component for declaratively preventing scroll bleed from modal UI to the page body. This component applies a `lockscroll` class to the `document.documentElement` and `document.scrollingElement` elements to stop the body from scrolling. When it is present, the lock is applied.

## Usage

Declare scroll locking as part of modal UI.

```jsx
import { ScrollLock } from '@wordpress/components';

function Sidebar( { isMobile } ) {
	return (
		<div>
			Sidebar Content!
			{ isMobile && <ScrollLock /> }
		</div>
	);
}
```
