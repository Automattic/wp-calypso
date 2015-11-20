Olark chatbox
=============

***Note this is still a work in progress and should not be used in production yet.
It lacks responsivness among other things***

This component allows you to render the olark chat widget inline on any page. 

#### Why we need this
Olarks api doesn't seem like it was built with our use case in mind (A single load javascript app). Their API doesn't offer the ability for its chat widget to go from inline -> floating or vice versa without performing a page refresh. Their API also doesn't offer any tear down or uninitialization methods that would allow us to pull off the floating -> inline -> floating switching we need.

#### How it works
This component takes control of the floating olark chat widget and inlines it within our DOM node. We then apply some CSS to the widget once it's inlined so that it looks like a standalone inlined chat component.


*Note that you can only have a single chatbox on a page since we only have one olark widget to take control of.*


#### How to use it:

```js
var React = require( 'react' ),
	Main = require( 'components/main' ),
	OlarkChatbox = require( 'components/olark-chatbox' );

module.exports = React.createClass( {
	render: function() {
		return (
			<Main>
				<OlarkChatbox />
			</Main>
		);
	}
} );

```