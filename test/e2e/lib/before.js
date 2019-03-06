/** @format */

// Check for NODE_ENV and warn if not set
const nodeEnv = process.env.NODE_ENV;

if ( nodeEnv === '' || nodeEnv === undefined ) {
	throw 'WARNING: NODE_ENV environment variable is not set.';
}
