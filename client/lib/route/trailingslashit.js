const trailingSlashRe = /(\/)?$/;

export default function trailingSlashIt( path ) {
	return path.replace( trailingSlashRe, '/' );
}
