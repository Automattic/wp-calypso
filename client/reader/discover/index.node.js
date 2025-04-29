import {
	getAnyLanguageRouteParam,
	removeLocaleFromPathLocaleInFront,
} from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import DiscoverHeaderAndNavigation from 'calypso/reader/discover/components/header-and-navigation';
import PostPlaceholder from 'calypso/reader/stream/post-placeholder';
import renderHeaderSection from '../lib/header-section';
import { DiscoverDocumentHead } from './discover-document-head';
import { getSelectedTabTitle, DEFAULT_TAB } from './helper';

const discoverSsr = ( context, next ) => {
	context.renderHeaderSection = renderHeaderSection;

	// Handle both old query parameter-based routing and new path-based routing.
	let selectedTab = DEFAULT_TAB;
	// Extract the tab from the path for v2, ignoring query params.
	const cleanPath = context.path.split( '?' )[ 0 ];
	// Remove any locale prefix if it exists to get a clean path.
	const pathWithoutLocale = removeLocaleFromPathLocaleInFront( cleanPath );
	const pathParts = pathWithoutLocale.split( '/' );
	// Now pathParts[2] will consistently be the tab.
	selectedTab = pathParts[ 2 ] || DEFAULT_TAB;

	const tabTitle = getSelectedTabTitle( selectedTab );
	context.primary = (
		<>
			<DiscoverDocumentHead tabTitle={ tabTitle } />
			<DiscoverHeaderAndNavigation
				selectedTab={ selectedTab }
				effectiveTabSelection={ selectedTab }
			/>
			<PostPlaceholder />
		</>
	);
	next();
};

export default function ( router ) {
	const anyLangParam = getAnyLanguageRouteParam();

	router(
		[
			'/discover',
			'/discover/add-new',
			'/discover/firstposts',
			'/discover/tags',
			'/discover/reddit',
			'/discover/latest',
			`/${ anyLangParam }/discover`,
			`/${ anyLangParam }/discover/add-new`,
			`/${ anyLangParam }/discover/firstposts`,
			`/${ anyLangParam }/discover/tags`,
			`/${ anyLangParam }/discover/reddit`,
			`/${ anyLangParam }/discover/latest`,
		],
		ssrSetupLocale,
		discoverSsr,
		makeLayout
	);
}
