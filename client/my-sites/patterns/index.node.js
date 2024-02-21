import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
import { fetchPatterns, renderPatterns } from 'calypso/my-sites/patterns/controller';

export default function ( router ) {
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
