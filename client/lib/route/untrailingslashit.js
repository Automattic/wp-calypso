const trailingSlashRe = /\/$/;

module.exports = function unTrailingSlashIt( path ) {
	if ( path === '/' ) {
		return path;
	}
	return path.replace( trailingSlashRe, '' );
};
