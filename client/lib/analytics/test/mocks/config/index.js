const config = ( key ) => {
	if ( key === 'mc_analytics_enabled' ) {
		return true;
	}

	throw new Error( 'key ' + key + ' not expected to be needed' );
};

config.isEnabled = ( feature ) => {
	if ( 'google-analytics' === feature ) {
		return false;
	}

	throw new Error( 'config.isEnabled to ' + feature + ' not expected to be needed' );
};

export default config;
