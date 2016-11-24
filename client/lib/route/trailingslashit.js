var trailingSlashRe = /(\/)?$/;

module.exports = function trailingSlashIt( path ) {
	return path.replace( trailingSlashRe, '/' );
};
