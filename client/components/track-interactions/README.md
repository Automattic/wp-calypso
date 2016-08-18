# TrackInteractions

Wrap an element in `TrackInteractions` and any clicks on it will become trackable as Redux actions. The name of the component reflects the intention to support more than just clicks in the future (e.g. hover).

## Basic usage

```js
<TrackInteractions>
	<BigRedButton />
</TrackInteractions>
```

will render a button which, when clicked, will dispatch the following action:

```js
{
	type: 'COMPONENT_INTERACTION_TRACKED',
	eventType: 'click',
	component: 'BigRedButton',
}
```

## Collecting more data

`TrackInteractions` accepts one of the following optional arguments:

**`fields`** (string or array of strings): performs a [`deepPick`][deepPick] on the wrapped component's props and includes those picked values in the dispatched action:

```js
<TrackInteractions fields="theme.id">
	<ThemeMoreButton
		theme={ { id: 'twentysixteen', author: 'The WordPress team' } }
		options={ options } />
</TrackInteractions>
```

clicking yields:

```js
{
	type: 'COMPONENT_INTERACTION_TRACKED',
	eventType: 'click',
	component: 'ThemeMoreButton',
	theme.id: 'twentysixteen',
}
```

**`mapPropsToAction`** (function): for cases where `fields` isn't flexible enough:

```js
const mapPropsToAction = props => ( {
	name: props.theme.id,
	isCurrentTheme: props.theme.id === getCurrentTheme( state ),
} );

<TrackInteractions mapPropsToAction={ mapPropsToAction }>
	<ThemeMoreButton
		theme={ { id: 'twentysixteen', author: 'The WordPress team' } }
		options={ options } />
</TrackInteractions>
```

clicking yields:

```js
{
	type: 'COMPONENT_INTERACTION_TRACKED',
	eventType: 'click',
	component: 'ThemeMoreButton',
	name: 'twentysixteen',
	isCurrentTheme: true,
}
```

Be mindful that using `fields` or `mapPropsToAction` may overwrite the built-in `type`, `eventType`, and `component` properties if the keys collide. This may be useful when seeking to deliberately change the dispatched action's type, but should be avoided otherwise.

[deepPick]: https://github.com/Automattic/wp-calypso/tree/master/client/lib/deep-pick/
