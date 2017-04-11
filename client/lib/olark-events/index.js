/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import emitter from 'lib/mixins/emitter';

/**
 * Module variables
 **/
var olarkEvents = [
		'api.box.onShow',
		'api.box.onHide',
		'api.box.onExpand',
		'api.box.onShrink',
		'api.chat.onReady',
		'api.chat.onOperatorsAvailable',
		'api.chat.onOperatorsAway',
		'api.chat.onBeginConversation',
		'api.chat.onMessageToOperator',
		'api.chat.onMessageToVisitor',
		'api.chat.onCommandFromOperator',
		'api.chat.onOfflineMessageToOperator'
	],
	debug = debugModule( 'calypso:olark:events' ),
	boundEvents = {},
	initialized = false,
	olarkReady = false;

/**
 * OlarkEventEmitter An eventemitter that listens for events from the olark api and emits them.
 * @type {Object}
 */
var OlarkEventEmitter = {
	/**
	 * Initialize the OlarkEventEmitter object. This should only be called when the olark api object becomes available
	 */
	initialize: function() {
		if ( initialized ) {
			debug( 'Already initalized' );
			return;
		}

		initialized = true;

		// add a listener for each of the events we care about
		olarkEvents.forEach( ( event ) => this.addOlarkEventListener( event ) );

		debug( 'Initalized' );
	},

	/**
	 * Add an olark api event listener so that we can proxy it. This should only be called once per event
	 * @param {string} event The olark api event to listen for
	 */
	addOlarkEventListener: function( event ) {
		debug( 'Adding olark event listener: %s', event );

		if ( boundEvents[ event ] ) {
			// We only want to add one listener per event
			return;
		}

		// Keep track of what olark events we're listening to
		boundEvents[ event ] = true;
	},

	/**
	 * Our generic callback that proxies the event fired by olark to our listeners. This method should not be called directly
	 * @param  {string} event The olark api event
	 */
	olarkEventListener: function( event, ...args ) {
		debug( 'Olark event: %s', event );
		this.emit( event, ...args );
	}
};

// Inherit from EventEmitter
emitter( OlarkEventEmitter );

// Be the first to bind to the api.chat.onReady event so that we can make sure that the olarkReady flag is set as early as possible
OlarkEventEmitter.once( 'api.chat.onReady', function() {
	// Set the ready flag so that we can re-emit api.chat.onReady for a listener if they missed it
	olarkReady = true;
} );

OlarkEventEmitter.on( 'newListener', function( event, callback ) {
	// listen for newListeners that are listening for the onReady event so that we can execute their callback if the ready event has already fired.
	// This is done because that is the way the olark api handles this event and we want to replicate that.
	if ( olarkReady && event === 'api.chat.onReady' ) {
		callback();
	}
} );

export default OlarkEventEmitter;
