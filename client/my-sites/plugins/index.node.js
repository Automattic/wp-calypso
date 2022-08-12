import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
import { browsePlugins, browsePluginsOrPlugin } from './controller';
import {
	fetchPlugins,
	fetchPlugin,
	fetchCategoryPlugins,
	validatePlugin,
	skipIfLoggedIn,
} from './controller-logged-out';

export default function ( router ) {
	const langParam = getLanguageRouteParam();
	router( [
		`/${ langParam }/plugins/setup/:site?`,
		`/${ langParam }/plugins/upload/:site?`,
		`/${ langParam }/plugins/manage/:site?`,
		`/${ langParam }/plugins/:plugin/eligibility/:site?`,
		`/${ langParam }/plugins/:pluginFilter(active|inactive|updates)/:site_id?`,
		`/${ langParam }/plugins/browse/:category/:site`,
	] );

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
