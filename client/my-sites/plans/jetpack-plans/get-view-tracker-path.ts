const sitePattern = /\/:site\??/;
const siteSegment = '/:site';

export default function getViewTrackerPath( path: string, siteSlug?: string ): string {
	if ( siteSlug ) {
		if ( ! path.match( sitePattern ) ) {
			return path + siteSegment;
		}

		return path.replace( sitePattern, siteSegment );
	}

	return path.replace( sitePattern, '' );
}
