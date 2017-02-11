let config;

if ( typeof window !== 'undefined' && window.config ) {
	config = window.config;
	config.anyEnabled = window.anyEnabled;
	config.isEnabled = window.isEnabled;
} else {
	throw new Error( 'config not available' );
}

export default config;
