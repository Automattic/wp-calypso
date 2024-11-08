import { getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import PostPlaceholder from 'calypso/reader/stream/post-placeholder';
import renderHeaderSection from '../lib/header-section';
import { DiscoverDocumentHead } from './discover-document-head';
import { DiscoverHeader } from './discover-stream';
import { getSelectedTabTitle, DEFAULT_TAB } from './helper';

const discoverSsr = ( context, next ) => {
	context.renderHeaderSection = renderHeaderSection;

	const selectedTab = context.query.selectedTab || DEFAULT_TAB;
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

	router( [ '/discover', `/${ anyLangParam }/discover` ], ssrSetupLocale, discoverSsr, makeLayout );
}
