let config;
if ( typeof window !== 'undefined' ) {
	config = window.config;
	config.anyEnabled = window.anyEnabled;
	config.isEnabled = window.isEnabled;
} else {
	config = () => false;
	config.isEnabled = () => false;
	config.anyEnabled = () => false;
}

export default config;
