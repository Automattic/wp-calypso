Slot Fill
=========

Slot and Fill are a pair of components which enable developers to render elsewhere in a React element tree, a pattern often referred to as "portal" rendering. It is a pattern for component extensibility, where a single Slot may be occupied by an indeterminate number of Fills elsewhere in the application.

Slot Fill is heavily inspired by the [`react-slot-fill` library](https://github.com/camwest/react-slot-fill), but uses React's own portal rendering API, exposed as an unstable API in React 16 and slated to be promoted to a stable API in React 17.

## Usage

At the root of your application, you must render a `SlotFillProvider` which coordinates Slot and Fill rendering.

```jsx
import { SlotFillProvider } from '@wordpress/components';
import { render } from '@wordpress/element';
import App from './app';

render(
	<SlotFillProvider>
		<App />
	</SlotFillProvider>,
	document.getElementById( 'app' )
);
```

Then, render a Slot component anywhere in your application, giving it a name:

```jsx
const Toolbar = () => (
	<div className="toolbar">
		<Slot name="Toolbar" />
	</div>
);

Toolbar.Item = ( { children } ) => (
	<Fill name="Toolbar">
		{ children }
	</Fill>
);
```

Any Fill will automatically occupy this Slot space, even if rendered elsewhere in the application.

You can either use the Fill component directly, or a wrapper component type as in the above example to abstract the slot name from consumer awareness.

There is also `createSlotFill` helper method which was created to simplify the process of matching the corresponding `Slot` and `Fill` components:

```jsx
const { Fill, Slot } = createSlotFill( 'Toolbar' );

const ToolbarItem = () => (
	<Fill>
		My item
	</Fill>
);

const Toolbar = () => (
	<div className="toolbar">
		<Slot />
	</div>
); 
```

## Props

The `SlotFillProvider` component does not accept any props.

Both `Slot` and `Fill` accept a `name` string prop, where a `Slot` with a given `name` will render the `children` of any associated `Fill`s.

`Slot` accepts a `bubblesVirtually` prop which changes the event bubbling behaviour:

 - By default, events will bubble to their parents on the DOM hierarchy (native event bubbling)
 - If `bubblesVirtually` is set to true, events will bubble to their virtual parent in the React elements hierarchy instead.

`Slot` also accepts optional `children` function prop, which takes `fills` as a param. It allows to perform additional processing and wrap `fills` conditionally.

_Example_:
```jsx
const Toolbar = ( { isMobile } ) => (
	<div className="toolbar">
		<Slot name="Toolbar">
			{ ( fills ) => {
				return isMobile && fills.length > 3 ?
					<div className="toolbar__mobile-long">{ fills }</div> :
					fills;
			} }	
		</Slot>
	</div>
);
```
