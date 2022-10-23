import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { JSDOM } from 'jsdom';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
import { overrideSanitizeSectionRoot } from 'calypso/lib/plugins/sanitize-section-content';
import { isEnabled } from 'calypso/server/config';
import { browsePlugins } from './controller';
import { fetchPlugins, skipIfLoggedIn } from './controller-logged-out';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	if ( isEnabled( 'plugins/ssr-landing' ) ) {
		overrideSanitizeSectionRoot( new JSDOM().window );

		router(
			[ `/${ langParam }/plugins` ],
			skipIfLoggedIn,
			ssrSetupLocale,
			fetchPlugins,
			setHrefLangLinks,
			setLocalizedCanonicalUrl,
			browsePlugins,
			makeLayout
		);
	}

	router( [ `/${ langParam }/plugins`, `/${ langParam }/plugins/*` ], ssrSetupLocale );
}
