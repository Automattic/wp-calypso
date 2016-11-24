/**
 * External Dependencies
 */
var throttle = require( 'lodash/throttle' );

/**
 * A mixin that listens for window::resize events and informs a component
 *
 * The host should expose a `onWindowResize` method to be called when the window resizes
 */
var ObserveWindowSizeMixin = {
	componentDidMount: function() {
		// the throttled function has to be per instance
		this._handleWindowResize = throttle( this.onWindowResize, 100 );
		window.addEventListener( 'resize', this._handleWindowResize );
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'resize', this._handleWindowResize );
	}

	/* DO NOT DO THIS. It shares the debounce across all instances of the mixin.
	_handleWindowResize: throttle( function() {
		this.onWindowResize();
	}, 500 )
	*/
};

module.exports = ObserveWindowSizeMixin;
