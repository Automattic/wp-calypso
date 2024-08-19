const config = ( key ) => {
	if ( key === 'mc_analytics_enabled' ) {
		return true;
	}

	if ( key === 'google_analytics_key' ) {
		return 'foo';
	}

	throw new Error( 'key ' + key + ' not expected to be needed' );
};

export const isEnabled = ( feature ) => {
	if ( 'google-analytics' === feature ) {
		return false;
	}
	if ( 'safari-idb-mitigation' === feature ) {
		return false;
	}
	if ( 'ad-tracking' === feature ) {
		return true;
	}

	throw new Error( 'config.isEnabled to ' + feature + ' not expected to be needed' );
};

config.isEnabled = isEnabled;

export default config;
