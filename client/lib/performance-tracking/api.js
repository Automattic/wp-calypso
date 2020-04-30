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

/**
 * Adds metadata to LUX request.
 *
 * WARNING: please double check you don't send any Private Personal Information. A good rule of thumb is to only send booleans or numbers.
 *
 * LUX has a limit of 255 bytes of all metadata concatenated, so you may want to keep they names short.
 *
 * @param {object} metadata Object with key:values to add as metadata
 */
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
