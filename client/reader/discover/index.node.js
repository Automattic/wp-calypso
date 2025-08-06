import { getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import DiscoverHeaderAndNavigation from 'calypso/reader/discover/components/header-and-navigation';
import PostPlaceholder from 'calypso/reader/stream/post-placeholder';
import renderHeaderSection from '../lib/header-section';
import { DiscoverDocumentHead } from './discover-document-head';
import { getSelectedTabTitle, getDefaultTab } from './helper';
import { getLocalizedRoutes, getCurrentTab } from './routes';

const discoverSsr = ( context, next ) => {
	context.renderHeaderSection = renderHeaderSection;
	const selectedTab = getCurrentTab( context.path, getDefaultTab() );
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

	router( getLocalizedRoutes( anyLangParam ), ssrSetupLocale, discoverSsr, makeLayout );
}
