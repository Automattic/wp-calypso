import page from 'page';
import BlazePressWidget from 'calypso/components/blazepress-widget';
import { getSiteFragment } from 'calypso/lib/route';
import { siteSelection } from 'calypso/my-sites/controller';
import PromotedPostsRedesignI2 from 'calypso/my-sites/promote-post-i2/main';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getPrimarySiteSlug from 'calypso/state/selectors/get-primary-site-slug';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getAdvertisingDashboardPath } from './utils';

export const promotedPosts = ( context, next ) => {
	const { tab } = context.params;
	context.primary = <PromotedPostsRedesignI2 tab={ tab } />;
	next();
};

export const redirectToPrimarySite = ( context, next ) => {
	const siteFragment = context.params.site || getSiteFragment( context.path );

	if ( siteFragment ) {
		return next();
	}

	const state = context.store.getState();
	const primarySiteSlug = getPrimarySiteSlug( state );
	if ( primarySiteSlug !== null ) {
		page( `${ context.pathname }/${ primarySiteSlug }` );
	} else {
		siteSelection( context, next );
		page( getAdvertisingDashboardPath( '' ) );
	}
};

export const promoteWidget = ( context, next ) => {
	const { item } = context.params;

	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	const postId = item?.split( '-' )[ 1 ];

	const currentQuery = getCurrentQueryArguments( state );
	const source = currentQuery?.source?.toString();

	context.primary = (
		<BlazePressWidget
			isVisible={ true }
			siteId={ siteId }
			postId={ postId }
			keyValue={ item }
			source={ source }
		/>
	);

	next();
};
