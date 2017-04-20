module.exports = function( key ) {
	if ( key === 'mc_analytics_enabled' ) {
		return true;
	}

	if ( key === 'google_analytics_enabled' ) {
		return false;
	}

	throw new Error( 'key ' + key + ' not expected to be needed' );
};
