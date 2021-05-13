# Localized moment.js

This module provides support for using localized moment.js library inside React components.

## `withLocalizedMoment`

Is a higher-order component (HOC) that provides two props to the wrapped child:

- `moment` is the moment.js instance that the component can use to parse and format dates
- `momentLocale` is a string that contains the current locale slug (e.g., `en` or `de`).

### Usage

```jsx
import React from 'react';
import { withLocalizedMoment } from 'calypso/components/localized-moment';

class Label extends React.Component {
	render() {
		const { moment, date } = this.props;
		return <span>{ moment( date ).format( 'LLLL' ) }</span>;
	}
}

export default withLocalizedMoment( Label );
```

The exported component will format the `date` string prop using the current locale.
The component is reactive, i.e., when the locale changes, all wrapped components will be
automatically rerendered.

## `useLocalizedMoment`

Is a React hook that can be used inside stateless functional components. The function returns
the moment.js instance that can be used to parse and format dates. Its meaning is the same as
in `withLocalizedMoment`. It's just a different implementation of the same concept.

### Usage

```jsx
import React from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

export default function Label( { date } ) {
	const moment = useLocalizedMoment();
	return <span>{ moment( date ).format( 'LLLL' ) }</span>;
}
```

Once again, the exported `Label` component will format the `date` string prop and automatically
rerender on locale change.

## `MomentProvider`

All usages of `withLocalizedMoment` and `useLocalizedMoment` should be inside a React tree
that has `MomentProvider` mounted on top. The provider provides a context with the current locale
and all the subcomponents that consume the context will react to changes.

The `MomentProvider` component takes one prop: `currentLocale`. It is a string with the desired
locale slug.

### Usage

```jsx
import React from 'react';
import ReactDom from 'react-dom';
import MomentProvider from 'calypso/components/localized-moment/provider';

ReactDom.render(
	<MomentProvider currentLocale="cs">
		<Label date="2019-02-26T16:20:00" />
	</MomentProvider>,
	document.getElementById( 'root' )
);
```
