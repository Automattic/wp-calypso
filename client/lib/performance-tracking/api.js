const getLux = () => {
	const lux = window.LUX || {};
	// Reassign it so changes in LUX are picked when Lux starts
	window.LUX = lux;

	// Don't send the first navigation automatically, we'll do it.
	lux.auto = false;
	lux.debug = true;
	return lux;
};

export const startNavigation = ( { label, metadata = {} } ) => {
	const lux = getLux();

	if ( typeof lux.init !== 'function' ) {
		// Not initialized yet, we'll skip this navigation.
		return;
	}

	lux.init();
	lux.label = label;
	Object.entries( metadata ).forEach( ( [ key, value ] ) => {
		lux.addData( key, value );
	} );
};

export const stopNavigation = () => {
	const lux = getLux();

	if ( typeof lux.init !== 'function' ) {
		// Not initialized yet, we'll skip this navigation.
		return;
	}

	lux.send();
};
