const trailingSlashRe = /\/$/;

export default function unTrailingSlashIt( path ) {
	if ( path === '/' ) {
		return path;
	}
	return path.replace( trailingSlashRe, '' );
}
