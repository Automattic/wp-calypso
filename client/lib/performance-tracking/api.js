/**
 * Internal dependencies
 */
import config from 'config';

const getLux = () => {
	const lux = window.LUX || {};
	// Reassign it so changes in LUX are picked when Lux starts
	window.LUX = lux;

	// Don't send the first navigation automatically, we'll do it.
	lux.auto = false;
	lux.debug = true;
	return lux;
};

const addMetadata = ( metadata ) => {
	const lux = getLux();

	Object.entries( metadata ).forEach( ( [ key, value ] ) => {
		lux.addData( key, value );
	} );
};

export const startNavigation = ( { label, metadata = {} } = {} ) => {
	if ( ! config.isEnabled( 'rum-tracking/speedcurve' ) ) return;

	const lux = getLux();

	if ( typeof lux.init !== 'function' ) {
		// Not initialized yet, we'll skip this navigation.
		return;
	}

	lux.init();
	lux.label = label;
	addMetadata( metadata );
};

export const stopNavigation = ( { metadata = {} } = {} ) => {
	if ( ! config.isEnabled( 'rum-tracking/speedcurve' ) ) return;

	const lux = getLux();

	if ( typeof lux.send !== 'function' ) {
		// Not initialized yet, we'll skip this navigation.
		return;
	}

	addMetadata( metadata );
	lux.send();
};
