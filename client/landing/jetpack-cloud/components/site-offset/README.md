# loaded applySiteOffset

This module provides support for using applySiteOffset inside React components without including the necessary selectors and query components.

# `withApplySiteOffset`

Is a higher-order component (HOC) that provides one prop to the wrapped child:

- `applySiteOffset` is a function that takes any possible moment input and returns either a moment object with the site offset applied or null if enough information has not yet been loaded to apply a site's offset

## Usage

```jsx
import React from 'react';
import { withApplySiteOffset } from 'landing/jetpack-cloud/components/site-offset';

class Label extends React.Component {
	render() {
		const { moment, date } = this.props;
		const displayDate = applySiteOffset( date )?.format( 'LLLL' );
		return <span>{ displayDate ? displayDate : 'Loading...' }</span>;
	}
}

export default withApplySiteOffset( Label );
```

The exported component will format the `date` string prop using the current siteOffset.
The component is reactive, i.e., when the site offset information is loaded all wrapped components will be
automatically re-rendered.

# `useApplySiteOffset`

Is a React hook that can be used inside stateless functional components. The function returns
the same `applySiteOffset` function. Its meaning is the same as
in `withApplySiteOffset`. It's just a different implementation of the same concept.

## Usage

```jsx
import React from 'react';
import { useApplySiteOffset } from 'components/localized-moment';

export default function Label( { date } ) {
	const applySiteOffset = useApplySiteOffset();
	const displayDate = applySiteOffset( date )?.format( 'LLLL' );
	return <span>{ displayDate ? displayDate : 'Loading...' }</span>;
}
```

Once again, the exported `Label` component will format the `date` string prop and automatically
rerender on locale change.

# `SiteOffsetProvider`

All usages of `withApplySiteOffset` and `useApplySiteOffset` should be inside a React tree
that has `SiteOffsetProvider` mounted on top. The provider provides a context with the current locale
and all the subcomponents that consume the context will react to changes.

The `SiteOffsetProvider` component takes one prop: `site`. It is a string that is either the current site ID or slug. This means that this Provider will need to be used lower in the React Component Tree than normal.

## Usage

```jsx
import React from 'react';
import ReactDom from 'react-dom';
import { SiteOffsetProvider } from 'landing/jetpack-cloud/components/site-offset/context';

ReactDom.render(
	<SiteOffsetProvider siteId={ siteId }>
		<Label date="2019-02-26T16:20:00" />
	</SiteOffsetProvider>,
	document.getElementById( 'root' )
);
```
