/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:olark:chatbox' );

/**
 * Internal dependencies
 */
var OlarkEvents = require( 'lib/olark-events' );

module.exports = React.createClass( {
	/**
	 * Initialize our component by binding to all of the necessary olark events.
	 */
	componentDidMount: function() {
		debug( 'mounted' );

		// Bind to the onReady event so we know when we can grab and bind the olark widget to our component
		OlarkEvents.on( 'api.chat.onReady', this.bindOlarkWidget );

		// Lets bind to the onHide event so we can make sure that our chatbox is always visible by re-showing it
		OlarkEvents.on( 'api.box.onHide', this.showChatbox );

		// Lets bind to the onShrink event so we can make sure that our chatbox is always visible by re-expanding it
		OlarkEvents.on( 'api.box.onShrink', this.expandChatbox );
	},

	/**
	 * Handle the shutdown of our component by unbinding from all of the events we listened to and return the chat
	 * widget to its original DOM parent.
	 */
	componentWillUnmount: function() {
		OlarkEvents.off( 'api.chat.onReady', this.bindOlarkWidget );
		OlarkEvents.off( 'api.box.onHide', this.showChatbox );
		OlarkEvents.off( 'api.box.onShrink', this.expandChatbox );

		// Release the olark widget so that its nolonger inlined
		this.releaseOlarkWidget();

		debug( 'unmounted' );
	},

	/**
	 * Use the Olark API to show the chatbox
	 */
	showChatbox: function() {
		var olarkApi = window.olark;

		olarkApi( 'api.box.show' );
	},

	/**
	 * Use the Olark API to expand the chatbox
	 */
	expandChatbox: function() {
		var olarkApi = window.olark;

		olarkApi( 'api.box.expand' );
	},

	/**
	 * Take control of the olark widget by removing it from its DOM parent and adding it to our DOM node so that we can make it look inlined.
	 * This is also a callback for the api.chat.onReady event
	 */
	bindOlarkWidget: function() {
		var olarkWidget, dom = window.document;

		// Check if our component is still mounted
		if ( ! this.isMounted() ) {
			// If this component was unmounted before the api.chat.onReady event is fired then don't try to bind it to our component.
			// I'm unsure if removing the event listener before it is fired will make this unnecessary but this is double insurance
			return;
		}

		// Search for the floating olark widget in the document
		olarkWidget = dom.querySelector( '#habla_beta_container_do_not_rely_on_div_classes_or_names' );

		// Check for the widget in the document
		if ( ! olarkWidget ) {
			//If we couldn't find the widget for some reason then bail
			return;
		}

		// Save the parent of the widget so that we can return it when this component is unmounted
		this.originalDOMParent = olarkWidget.parentElement;

		// Expand/show the widget since we are inlining it
		this.showChatbox();
		this.expandChatbox();

		// Change the parent of the widget to our DOM node and save a refrence to it
		this.olarkDOMNode = ReactDom.findDOMNode( this ).appendChild( olarkWidget );

		debug( 'bind the olark chat widget' );
	},

	/**
	 * Change the olark widgets parent back to the body element.
	 */
	releaseOlarkWidget: function() {
		// If we don't find the widget in our node then it was never added and we have no need to go any further.
		if ( ! this.olarkDOMNode ) {
			return;
		}

		// Return the olark widget to its original DOM node
		this.originalDOMParent.appendChild( this.olarkDOMNode );

		debug( 'release the olark chat widget' );
	},

	/**
	 * Render our chatbox container div
	 * @return {object} jsx object
	 */
	render: function() {
		return (
			<div className="olark-chatbox__container" />
		);
	}
} );
