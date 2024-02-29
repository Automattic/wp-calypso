import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
import { fetchPatterns, Next } from 'calypso/my-sites/patterns/controller';
import PatternsSSR from 'calypso/my-sites/patterns/patterns-ssr';
import { serverRouter } from 'calypso/server/isomorphic-routing';
import type { Context as PageJSContext } from '@automattic/calypso-router';

function renderPatterns( context: PageJSContext, next: Next ) {
	context.primary = (
		<PatternsSSR category={ context.params.category } isGridView={ !! context.query.grid } />
	);

	next();
}

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
