# SiteHub

The `SiteHub` component provides a top-level navigation element displaying
the site title, a back navigation button, and access to the command palette.
It integrates with WordPress Core's entity data to
dynamically fetch site information.

## Usage

```tsx
export default function Example() {
	return (
		<SiteHub
			isTransparent={ false }
			exitLabel="Back to Dashboard"
			exitLink="/dashboard"
		/>
	);
}
```

## Handling ref in SiteHub

The SiteHub component uses `forwardRef` to allow external components to pass
a ref that directly references the navigation button.
This is useful for managing focus, triggering actions,
or integrating with accessibility tools.

```tsx
import { useRef, useEffect } from 'react';

export default function Example() {
	const buttonRef = useRef< HTMLButtonElement >( null );

	useEffect( () => {
		if ( buttonRef.current ) {
			buttonRef.current.focus();
		}
	}, [] );

	return (
		<SiteHub
			ref={ buttonRef }
			isTransparent={ false }
			exitLabel="Back"
			exitLink="/"
		/>
	);
}
```
