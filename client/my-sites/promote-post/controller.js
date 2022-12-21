import page from 'page';
import { getSiteFragment } from 'calypso/lib/route';
import { siteSelection } from 'calypso/my-sites/controller';
import PromotedPosts from 'calypso/my-sites/promote-post/main';
import getPrimarySiteSlug from 'calypso/state/selectors/get-primary-site-slug';

export const promotedPosts = ( context, next ) => {
	const { tab } = context.params;
	context.primary = <PromotedPosts tab={ tab } />;
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
		page( `/advertising/${ primarySiteSlug }` );
	} else {
		siteSelection( context, next );
		page( `/advertising` );
	}
};
