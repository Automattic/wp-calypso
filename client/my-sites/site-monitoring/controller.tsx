import { getSelectedSite } from 'calypso/state/ui/selectors';
import { SiteMetrics } from './main';
import type { Callback } from '@automattic/calypso-router';

export const siteMetrics: Callback = ( context, next ) => {
	context.primary = <SiteMetrics tab={ context.params.tab } />;
	next();
};

export const redirectHomeIfIneligible: Callback = ( context, next ) => {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	const isAtomicSite = !! site?.is_wpcom_atomic || !! site?.is_wpcom_staging_site;

	if ( ! isAtomicSite ) {
		context.page.replace( `/overview/${ site?.slug }` );
		return;
	}
	next();
};
