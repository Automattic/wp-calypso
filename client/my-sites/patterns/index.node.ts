import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
import { fetchPatterns, renderPatterns } from 'calypso/my-sites/patterns/controller';
import { serverRouter } from 'calypso/server/isomorphic-routing';

export default function ( router: ReturnType< typeof serverRouter > ) {
	const langParam = getLanguageRouteParam();

	router(
		[ '/patterns', `/${ langParam }/patterns` ],
		ssrSetupLocale,
		setHrefLangLinks,
		setLocalizedCanonicalUrl,
		fetchPatterns,
		renderPatterns,
		makeLayout
	);
}
