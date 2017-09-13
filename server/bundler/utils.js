// Adapts route paths to also include wildcard
// subroutes under the root level section.
function pathToRegExp( path ) {
	// Prevents root level double dash urls from being validated.
	if ( path === '/' ) {
		return path;
	}
	return new RegExp( '^' + path + '(/.*)?$' );
}

module.exports = {
	pathToRegExp: pathToRegExp
};
