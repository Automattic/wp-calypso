/**
 * Credit: Modified from `winston-namespace` by @SetaSouto:
 * 	https://github.com/SetaSouto/winston-namespace
 */

module.exports = {
	/**
	 * Boolean indicating if the object is populated with the environment data.
	 */
	populated: false,
	/**
	 * Populates the private data 'namespaces' as an array with the different namespaces from the DEBUG
	 * environment variable. It splits the data with ',' as separator.
	 */
	populate: function () {
		const envString = process.env.DEBUG;
		this.namespaces = envString ? envString.split( ',' ) : [];
		this.populated = true;
	},
	/**
	 * Checks if the namespace is available to debug. The namespace could be contained in wildcards.
	 * Ex: 'server:api:controller' would pass the check (return true) if the 'server:api:controller' is in the
	 * environment variable or if 'server:api:*' or 'server:*' is in the environment variable.
	 *
	 * @param namespace {String} - Namespace to check.
	 * @returns {boolean} Whether or not the namespace is available.
	 */
	check: function ( namespace ) {
		if ( ! this.populated ) this.populate();
		if ( this.namespaces.indexOf( '*' ) !== -1 ) return true;
		if ( this.namespaces.indexOf( namespace ) !== -1 ) return true;
		/* If it is as 'server:api:controller', it could have a wildcard as 'server:*' */
		if ( namespace.indexOf( ':' ) !== -1 ) {
			/* Different levels of the namespace. Using the example of above: 'server' is level 0, 'api' is level 1 and
			 * 'controller' is level 2. */
			const levels = namespace.split( ':' );
			for ( let i = 1; i < levels.length; i++ ) {
				const level = levels.slice( 0, i ).join( ':' ) + ':*';
				if ( this.namespaces.includes( level ) ) return true;
			}
		}
		return false;
	},
};
