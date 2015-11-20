Olark Store
===========

A FLUX store to provide the data we need from olark.

#### Data

This module exposes four pieces of data that we care about and emits a `change` event when any of them are changed:
* **api** - Should be a shortcut to `window.olark`
* **isOlarkReady** - Should be `true` when the [api.chat.onReady](https://www.olark.com/api#api.chat.onReady) event has fired and `false` otherwise
* **isOperatorAvailable** - `true` if support operators are available to host the chat and false otherwise. The [api.chat.onOperatorsAway](https://www.olark.com/api#api.chat.onOperatorsAway) and [api.chat.onOperatorsAvailable](https://www.olark.com/api#api.chat.onOperatorsAvailable) Should be used to figure this out.
* **isUserEligible** - If `false` then the user should not be able to initiate a chat. This is false by default
* **locale** - The locale for the olark group (Indicates the language spoken by the happiness engineers in this group).
* **details** - The result of a call to the [api.visitor.getDetails](https://www.olark.com/api#api.visitor.getDetails) api call.

#### Actions

The action methods include:
* **setApi( api )** - Indicate that the api olark api has become available. This should always be `window.olark`
* **setReady()** - Tell the data store that olark chat is ready. Ideally this would be hooked into the [api.chat.onReady](https://www.olark.com/api#api.chat.onReady) event.
* **setOperatorsAvailable()** - Indicate that operators are available. This should be called during the [api.chat.onOperatorsAvailable](https://www.olark.com/api#api.chat.onOperatorsAvailable)
* **setOperatorsAway()** - Indicate that operators are no longer available. This should be called during the [api.chat.onOperatorsAway](https://www.olark.com/api#api.chat.onOperatorsAway) event
* **setUserEligibility( isUserEligible )** - Indicate that the current user is eligible to initiate a chat.
* **setLocale( locale )** - Indicate the language spoken by the happiness engineers.
* **updateDetails()** - Update the olark details. This method depends on the api being available and should be called whenever an interested component is mounted and when any of the following olark events are observed:
 * [api.chat.onBeginConversation](https://www.olark.com/api#api.chat.onBeginConversation)
 * [api.chat.onMessageToVisitor](https://www.olark.com/api#api.chat.onMessageToVisitor)
 * [api.chat.onMessageToOperator](https://www.olark.com/api#api.chat.onMessageToOperator)
 * [api.chat.onCommandFromOperator](https://www.olark.com/api#api.chat.onCommandFromOperator)
 * [api.chat.onOperatorsAvailable](https://www.olark.com/api#api.chat.onOperatorsAvailable)
 * [api.chat.onOperatorsAway](https://www.olark.com/api#api.chat.onOperatorsAway)
 * [api.chat.onReady](https://www.olark.com/api#api.chat.onReady)

#### Example

```jsx
import React from 'react';
import olarkStore from 'lib/olark-store';
import olarkStoreActions from 'lib/olark-store/actions';

export React.createClass( {
	displayName: 'ExampleChatComponent',

	componentDidMount: function() {
		olarkStore.on( 'change', this.updateOlarkState );

		olarkStoreActions.updateDetails();
	},

	componentWillUnmount: function() {
		olarkStore.removeListener( 'change', this.updateOlarkState );
	},

	getInitialState: function() {
		return {
			olark: olarkStore.get()
		};
	},

	updateOlarkState: function() {
		this.setState( { olark: olarkStore.get() } );
	},

	startChat: function() {
		// TODO: Add some logic that will initiate a chat. :)
	},

	render: function() {
		const olark = this.state.olark;

		if ( ! olark.isOlarkReady ) {
			// Olark isn't ready yet so lets show a place holder
			return <div className="placeholder" />;
		}

		if ( olark.isOperatorAvailable ) {
			// Operators are available to chat so lets show a button that will start a chat for the user
			return <button className="button is-primary" onClick={ this.startChat }>Ask for help</button>;
		}

		return <span>Please wait for the next available operator...</span>
	},
} );

```
