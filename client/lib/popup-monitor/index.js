/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import Emitter from 'lib/mixins/emitter';

/**
 * PopupMonitor component
 *
 * @public
 */
function PopupMonitor() {
	this.intervals = {};
	this.monitorInterval = null;
}

/**
 * Mixins
 */
Emitter( PopupMonitor.prototype );

/**
 * Opens a new popup and starts monitoring it for changes. This should only be
 * invoked on a user action to avoid the popup being blocked. Returns the
 * current instance of PopupMonitor to enable chainability
 *
 * @param (string) url The URL to be loaded in the newly opened window
 * @param (string) name A string name for the new window
 * @param (string) specs An optional parameter listing the features of the new window as a string
 * @public
 */
PopupMonitor.prototype.open = function( url, name, specs ) {
	var windowInstance;
	name = name || Date.now();

	windowInstance = window.open( url, name, specs );
	this.startMonitoring( name, windowInstance );

	return this;
};

/**
 * Returns a popup window specification string fragment containing properties
 * to visually center the popup on the user's current screen.
 *
 * @param  {number} width The desired width of the popup
 * @param  {number} height The desired height of the popup
 * @return {string} Popup window specificatino string fragment
 * @public
 */
PopupMonitor.prototype.getScreenCenterSpecs = function( width, height ) {
	var screenTop = typeof window.screenTop !== 'undefined' ? window.screenTop : window.screenY,
		screenLeft = typeof window.screenLeft !== 'undefined' ? window.screenLeft : window.screenX;

	return [
		'width=' + width,
		'height=' + height,
		'top=' + ( screenTop + window.innerHeight / 2 - height / 2 ),
		'left=' + ( screenLeft + window.innerWidth / 2 - width / 2 ),
	].join();
};

/**
 * Returns true if the popup with the specified name is closed, or false
 * otherwise
 *
 * @param (string) name The name of the popup window to check
 * @public
 */
PopupMonitor.prototype.isOpen = function( name ) {
	var isClosed = false;

	try {
		isClosed = this.intervals[ name ] && this.intervals[ name ].closed;
	} catch ( e ) {}

	return ! isClosed;
};

/**
 * Detects if any popup windows have closed since the last interval run and
 * triggers a close event for any closed windows. If no popup windows remain
 * open, then the interval is stopped.
 */
PopupMonitor.prototype.checkStatus = function() {
	for ( var name in this.intervals ) {
		if ( this.intervals.hasOwnProperty( name ) && ! this.isOpen( name ) ) {
			this.emit( 'close', name );
			delete this.intervals[ name ];
		}
	}

	if ( 0 === Object.keys( this.intervals ).length ) {
		clearInterval( this.monitorInterval );
		delete this.monitorInterval;
	}
};

/**
 * Starts monitoring a popup window instance for changes on a recurring
 * interval.
 *
 * @param (string) name The name of hte popup window to monitor
 * @param (window) windowInstance The popup window instance
 */
PopupMonitor.prototype.startMonitoring = function( name, windowInstance ) {
	if ( ! this.monitorInterval ) {
		this.monitorInterval = setInterval( this.checkStatus.bind( this ), 100 );
	}

	this.intervals[ name ] = windowInstance;
};

/**
 * Expose `PopupMonitor`
 */
export default PopupMonitor;
