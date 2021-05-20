const sitePattern = /\/:site\??/;
const siteSegment = '/:site';

export default function getViewTrackerPath( path: string, siteId?: number | null ): string {
	if ( siteId ) {
		if ( ! path.match( sitePattern ) ) {
			return path + siteSegment;
		}

		return path.replace( sitePattern, siteSegment );
	}

	return path.replace( sitePattern, '' );
}
