module.exports = function( key ) {
	if ( key === 'mc_analytics_enabled' ) {
		return true;
	}

	throw new Error( 'key ' + key + ' not expected to be needed' );
};
