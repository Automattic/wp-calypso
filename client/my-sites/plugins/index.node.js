import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { JSDOM } from 'jsdom';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
import { overrideSanitizeSectionRoot } from 'calypso/lib/plugins/sanitize-section-content';
import { browsePlugins, browsePluginsOrPlugin } from './controller';
import {
	fetchPlugins,
	fetchCategoryPlugins,
	fetchPlugin,
	validatePlugin,
	skipIfLoggedIn,
} from './controller-logged-out';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

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

	router(
		`/${ langParam }/plugins/browse/:category`,
		skipIfLoggedIn,
		ssrSetupLocale,
		fetchCategoryPlugins,
		setHrefLangLinks,
		setLocalizedCanonicalUrl,
		browsePlugins,
		makeLayout
	);

	router(
		`/${ langParam }/plugins/:plugin`,
		skipIfLoggedIn,
		validatePlugin,
		ssrSetupLocale,
		fetchPlugin,
		setHrefLangLinks,
		setLocalizedCanonicalUrl,
		browsePluginsOrPlugin,
		makeLayout
	);

	router( [ `/${ langParam }/plugins`, `/${ langParam }/plugins/*` ], ssrSetupLocale );
}
