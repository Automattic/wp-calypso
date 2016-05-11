Localize
========

`localize` is a higher-order component which, when invoked as a function with a component, returns a new component class. The new component wraps the original component, passing all original props plus props to assist in localization (`translate`, `moment`, and `numberFormat`). The advantage of using a higher-order component instead of calling translate directly from the `lib/i18n/mixins` module is that the latter does not properly account for change events which may be emitted by the state emitter object.

It should act as a substitute to the existing i18n mixin which provides the `this.translate`, `this.moment`, and `this.numberFormat` functions. Notably, the higher-order component can be used for components which do not support mixins, including those inheriting the `Component` class or stateless function components.

## Usage

Typically, you'd wrap your exported function with `localize`:

```jsx
// greeting.jsx
import React from 'react';
import localize from 'i18n/localize';

function Greeting( { translate, className } ) {
	return (
		<h1 className={ className }>
			{ translate( 'Hello!' ) }
		</h1>
	);
}

export default localize( Greeting );
```

When the wrapped component is rendered, the render behavior of the original component is used, but with access to localization props.

```jsx
// index.jsx
import React from 'react';
import { render } from 'react-dom';
import Greeting from './greeting';

render(
	<Greeting className="greeting" />,
	document.body
);
```

## TODO

- Extract into a separate module
