import { isEnabled } from '@automattic/calypso-config';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SiteMetrics } from './main';
import type { Callback } from '@automattic/calypso-router';

export const siteMetrics: Callback = ( context, next ) => {
	context.primary = <SiteMetrics tab={ context.params.tab } />;
	next();
};

export const redirectHomeIfIneligible: Callback = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const site = getSelectedSite( state );
	const isAtomicSite = !! site?.is_wpcom_atomic || !! site?.is_wpcom_staging_site;

	if ( isEnabled( 'layout/dotcom-nav-redesign-v2' ) ) {
		if ( ! isAtomicSite ) {
			context.page.replace( `/overview/${ site?.slug }` );
			return;
		}
		next();
		return;
	}

	if ( ! isAtomicSite ) {
		context.page.replace( `/home/${ context.params.siteId }` );
		return;
	}

	if ( isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } ) ) {
		context.page.replace( `/stats/day/${ context.params.siteId }` );
		return;
	}

	next();
};
