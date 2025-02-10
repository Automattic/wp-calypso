import config from '@automattic/calypso-config';
import { getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import PostPlaceholder from 'calypso/reader/stream/post-placeholder';
import renderHeaderSection from '../lib/header-section';
import { DiscoverDocumentHead } from './discover-document-head';
import { DiscoverHeader } from './discover-stream';
import { getSelectedTabTitle, DEFAULT_TAB } from './helper';

const discoverSsr = ( context, next ) => {
	context.renderHeaderSection = renderHeaderSection;

	// Handle both old query parameter-based routing and new path-based routing
	let selectedTab = DEFAULT_TAB;
	if ( config.isEnabled( 'reader/discovery-v2' ) ) {
		// Extract the tab from the path for v2
		const pathParts = context.path.split( '/' );
		selectedTab = pathParts[ 2 ] || DEFAULT_TAB;
	} else {
		// Use query parameter for v1
		selectedTab = context.query.selectedTab || DEFAULT_TAB;
	}

	const tabTitle = getSelectedTabTitle( selectedTab );
	context.primary = (
		<>
			<DiscoverDocumentHead tabTitle={ tabTitle } />
			<DiscoverHeader selectedTab={ selectedTab } />
			<PostPlaceholder />
		</>
	);
	next();
};

export default function ( router ) {
	const anyLangParam = getAnyLanguageRouteParam();

	if ( config.isEnabled( 'reader/discovery-v2' ) ) {
		// New path-based routes for v2
		router(
			[
				'/discover',
				'/discover/recommended',
				'/discover/add-new',
				'/discover/first-posts',
				'/discover/tags',
				'/discover/reddit',
				'/discover/latest',
				`/${ anyLangParam }/discover`,
				`/${ anyLangParam }/discover/recommended`,
				`/${ anyLangParam }/discover/add-new`,
				`/${ anyLangParam }/discover/first-posts`,
				`/${ anyLangParam }/discover/tags`,
				`/${ anyLangParam }/discover/reddit`,
				`/${ anyLangParam }/discover/latest`,
			],
			ssrSetupLocale,
			discoverSsr,
			makeLayout
		);
	} else {
		// Original query parameter-based route for v1
		router(
			[ '/discover', `/${ anyLangParam }/discover` ],
			ssrSetupLocale,
			discoverSsr,
			makeLayout
		);
	}
}
