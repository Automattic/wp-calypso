import { isEnabled } from '@automattic/calypso-config';
import page, { type Callback } from '@automattic/calypso-router';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import SiteRedesign from './main';

const REDESIGN_ID = /^rd_[0-9a-f]{32}$/;

export const requireSiteRedesignAccess: Callback = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	if (
		! isEnabled( 'themes/site-redesign' ) ||
		! siteId ||
		! canCurrentUser( state, siteId, 'manage_options' ) ||
		! canCurrentUser( state, siteId, 'edit_theme_options' )
	) {
		page.redirect( siteSlug ? `/themes/${ siteSlug }` : '/themes' );
		return;
	}
	next();
};

export const renderSiteRedesign: Callback = ( context, next ) => {
	const state = context.store.getState();
	const redesignId = String( context.query.redesign ?? '' );
	context.primary = (
		<SiteRedesign
			siteId={ getSelectedSiteId( state ) as number }
			siteSlug={ getSelectedSiteSlug( state ) as string }
			redesignId={ REDESIGN_ID.test( redesignId ) ? redesignId : null }
			resume={ context.query.resume === 'apply' }
		/>
	);
	next();
};
