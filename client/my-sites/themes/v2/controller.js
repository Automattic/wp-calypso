import trackScrollPage from 'calypso/lib/track-scroll-page';
import { getAnalyticsData } from 'calypso/my-sites/themes/helpers';
import Lots from 'calypso/my-sites/themes/v2/components/lots';
import ThemesShowcasePage from 'calypso/my-sites/themes/v2/components/themes-showcase-page';
import { Category, Tier } from 'calypso/my-sites/themes/v2/types';
import performanceMark from 'calypso/server/lib/performance-mark';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export function getProps( context ) {
	const { category, tier, filter, vertical, view } = context.params;

	const { analyticsPath, analyticsPageTitle } = getAnalyticsData( context.path, context.params );

	const boundTrackScrollPage = function () {
		trackScrollPage( analyticsPath, analyticsPageTitle, 'Themes' );
	};

	const state = context.store.getState();

	return {
		category,
		tier: tier ?? Tier.DEFAULT,
		filter: filter ?? category ?? Category.DEFAULT,
		vertical,
		analyticsPageTitle,
		analyticsPath,
		search: context.query.s ?? '',
		isCollectionView: view === 'collection',
		pathName: context.pathname,
		isLoggedIn: isUserLoggedIn( state ),
		trackScrollPage: boundTrackScrollPage,
	};
}

const buildThemeShowcasePage = ( context, layout ) => {
	const { pathName, ...otherProps } = getProps( context );

	return (
		<ThemesShowcasePage { ...otherProps } canonicalUrl={ 'https://wordpress.com' + pathName }>
			{ layout }
		</ThemesShowcasePage>
	);
};

export function displayLoTS( context, next ) {
	const { isCollectionView, isLoggedIn } = getProps( context );

	// Don't display collection views for now.
	if ( isCollectionView ) {
		return next();
	}

	if ( isLoggedIn ) {
		performanceMark( context, 'LiTS action' );
	} else {
		performanceMark( context, 'LoTS action' );
		context.primary = buildThemeShowcasePage( context, <Lots /> );
	}

	next();
}
