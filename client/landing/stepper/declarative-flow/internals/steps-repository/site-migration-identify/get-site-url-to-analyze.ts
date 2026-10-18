import { getUrlParts } from '@automattic/calypso-url';
import { CAPTURE_URL_RGX } from 'calypso/blocks/import/util';

export function getSiteUrlToAnalyze( url: string ): string {
	if ( ! CAPTURE_URL_RGX.test( url ) ) {
		return url;
	}

	const { hostname, pathname, origin } = getUrlParts(
		/^https?:\/\//i.test( url ) ? url : `https://${ url }`
	);
	const isSubstackPublication = /^(?!www\.|open\.)[a-z0-9-]+\.substack\.com$/.test( hostname );
	const isPost = /^\/(?:p|publish\/post)\/.+/.test( pathname );

	return isSubstackPublication && isPost ? origin : url;
}
