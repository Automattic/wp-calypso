import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { JSDOM } from 'jsdom';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { setEnglishCanonicalUrl } from 'calypso/controller/localized-links';
import { setupPreferences } from 'calypso/controller/preferences';
import { overrideSanitizeSectionRoot } from 'calypso/lib/plugins/sanitize-section-content';
import { browsePlugins, browsePluginsOrPlugin } from './controller';
import {
	fetchPlugins,
	fetchCategoryPlugins,
	fetchPlugin,
	validatePlugin,
	skipIfLoggedIn,
	setBrowsePluginsNoindex,
} from './controller-logged-out';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	overrideSanitizeSectionRoot( new JSDOM().window );

	router(
		[ `/${ langParam }/plugins` ],
		skipIfLoggedIn,
		ssrSetupLocale,
		setupPreferences,
		fetchPlugins,
		setEnglishCanonicalUrl,
		browsePlugins,
		makeLayout
	);

	router(
		`/${ langParam }/plugins/browse/:category`,
		skipIfLoggedIn,
		ssrSetupLocale,
		setupPreferences,
		fetchCategoryPlugins,
		setEnglishCanonicalUrl,
		setBrowsePluginsNoindex,
		browsePlugins,
		makeLayout
	);

	router(
		`/${ langParam }/plugins/:plugin`,
		skipIfLoggedIn,
		validatePlugin,
		ssrSetupLocale,
		setupPreferences,
		fetchPlugin,
		setEnglishCanonicalUrl,
		browsePluginsOrPlugin,
		makeLayout
	);

	router( [ `/${ langParam }/plugins`, `/${ langParam }/plugins/*` ], ssrSetupLocale );
}
