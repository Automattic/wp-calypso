// Check for NODE_CONFIG_ENV and warn if not set
const nodeEnv = process.env.NODE_CONFIG_ENV;

if ( nodeEnv === '' || nodeEnv === undefined ) {
	throw 'WARNING: NODE_CONFIG_ENV environment variable is not set.';
}
