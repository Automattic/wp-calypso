Plugin Card Header
==================

This component is used to display a header that is positioned directly on top of a card.

#### How to use:

By default, the `PluginCardHeader` component expects a `text` prop and will render that text within a `CompactCard`.

```js
var PluginCardHeader = require( 'my-sites/plugins/plugin-card-header' );

render: function() {
	return (
		<PluginCardHeader text={ this.translate( 'Plugin Information' ) } />
	);
}
```

![PluginCardHeader text example](https://cldup.com/tpJ1op2sLO.png)

This behavior can be overridden by passing children into the `PluginCardHeader` component as opposed to a `text` prop.

```js
var PluginCardHeader = require( 'my-sites/plugins/plugin-card-header' ),
	HeaderCake = require( 'components/header-cake' );

render: function() {
	return (
		<PluginCardHeader>
			<HeaderCake onClick={ this.goBack } />
		</PluginCardHeader>
	);
}
```

![PluginCardHeader children example](https://cldup.com/hzslkuMRXc.png)

#### Props

* `text` : (string) The header text.
