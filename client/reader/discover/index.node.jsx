import { getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import DiscoverHeaderAndNavigation from 'calypso/reader/discover/components/header-and-navigation';
import PostPlaceholder from 'calypso/reader/stream/post-placeholder';
import { setDiscoverLoggedOutHero } from './components/logged-out-hero';
import { DiscoverDocumentHead } from './discover-document-head';
import { getLocalizedRoutes, getSelectedTab } from './routes';
import { setDiscoverTagNoindex } from './set-discover-tag-noindex';

const discoverSsr = ( context, next ) => {
	setDiscoverLoggedOutHero( context );
	const selectedTab = getSelectedTab( context.path );

	context.primary = (
		<>
			<DiscoverDocumentHead noindex={ !! context.query?.selectedTag } />
			<DiscoverHeaderAndNavigation selectedTab={ selectedTab } />
			<PostPlaceholder />
		</>
	);
	next();
};

function redirectRetiredReddit( context ) {
	const localePrefix = context.params.lang ? `/${ context.params.lang }` : '';
	// Server route context exposes originalUrl, not querystring.
	const queryIndex = context.originalUrl.indexOf( '?' );
	const query = queryIndex >= 0 ? context.originalUrl.slice( queryIndex ) : '';
	context.res.redirect( 301, `${ localePrefix }/discover/add-new${ query }` );
}

export default function ( router ) {
	const anyLangParam = getAnyLanguageRouteParam();

	// Reddit ended RSS. Old Discover links land on the generic add-a-feed form.
	router( [ '/discover/reddit', `/${ anyLangParam }/discover/reddit` ], redirectRetiredReddit );

	router(
		getLocalizedRoutes( anyLangParam ),
		ssrSetupLocale,
		setDiscoverTagNoindex,
		discoverSsr,
		makeLayout
	);
}
