# React Localization Helpers for RTL

This module provides React helpers to figure out the LTR/RTL flag of the current `i18n-calypso`
locale, make it available to React components and update automatically on locale change.

# `useRtl` React Hook

Hook function that returns the `isRtl` boolean flag and automatically rerenders the component
(i.e., updates its internal state) when app locale changes from LTR to RTL language and back.

Example:

```jsx
import React from 'react';
import Gridicon from 'components/gridicon';
import { useRtl } from 'components/rtl';

export default function Header() {
	const isRtl = useRtl();
	const icon = isRtl ? 'arrow-left' : 'arrow-right';
	return (
		<div>
			<Gridicon icon={ icon } />
			Header With Back Arrow
		</div>
	);
}
```

# `withRtl` Higher-Order Component

The same functionality is also exposed as a HOC that passes an `isRtl` prop to the wrapped component.

Example:

```jsx
import React from 'react';
import Gridicon from 'components/gridicon';
import { withRtl } from 'components/rtl';

function Header( { isRtl } ) {
	const icon = isRtl ? 'arrow-left' : 'arrow-right';
	return (
		<div>
			<Gridicon icon={ icon } />
			Header With Back Arrow
		</div>
	);
}

export default withRtl( Header );
```
