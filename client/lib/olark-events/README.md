Olark Events
=============

This module allows you to bind and unbind from olark api events.

Olarks api does not allow you to unbind from their events which prevents us from properly cleaning up any related event listeners when a component is unloaded. This module subscribes to olark api events and proxies them to which ever component has added a listener.

#### Events that can be listened to include:
* [api.box.onShow](https://www.olark.com/api#api.box.onShow)
* [api.box.onHide](https://www.olark.com/api#api.box.onHide)
* [api.box.onExpand](https://www.olark.com/api#api.box.onExpand)
* [api.box.onShrink](https://www.olark.com/api#api.box.onShrink)
* [api.chat.onReady](https://www.olark.com/api#api.chat.onReady)
* [api.chat.onOperatorsAvailable](https://www.olark.com/api#api.chat.onOperatorsAvailable)
* [api.chat.onOperatorsAway](https://www.olark.com/api#api.chat.onOperatorsAway)
* [api.chat.onBeginConversation](https://www.olark.com/api#api.chat.onBeginConversation)
* [api.chat.onMessageToOperator](https://www.olark.com/api#api.chat.onMessageToOperator)
* [api.chat.onMessageToVisitor](https://www.olark.com/api#api.chat.onMessageToVisitor)
* [api.chat.onCommandFromOperator](https://www.olark.com/api#api.chat.onCommandFromOperator)
* [api.chat.onOfflineMessageToOperator](https://www.olark.com/api#api.chat.onOfflineMessageToOperator)

*Note: `api.chat.onReady` is an event that is always fired when listened to if the api is ready. That means if it is ready and you begin listening for it after it has already fired, it will still execute your callback. We have replicated this behavior in our module.*


#### How to use:

```js
var React = require( 'react' ),
	Main = require( 'components/main' ),
	olarkEvents = require( 'lib/olark-events' );

module.exports = React.createClass( {
	componentDidMount: function() {
		olarkEvents.on( 'api.chat.onReady', this.onReady );
	},

	componentWillUnmount: function() {
		olarkEvents.off( 'api.chat.onReady', this.onReady );
	},

	onReady: function() {
		this.setState( { 'ready': true } );
	},

	render: function() {
		var readyMessage;

		if ( this.state && this.state.ready ) {
			readyMessage = ( <span>Chat is ready.</span> );
		}
		else {
			readyMessage = ( <span>Chat is not ready yet.</span> );
		}

		return (
			<Main>
				{readyMessage}
			</Main>
		);
	}
} );
```