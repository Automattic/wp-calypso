import page from '@automattic/calypso-router';
import { fetchModuleList } from 'calypso/state/jetpack/modules/actions';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { isSupportSession } from 'calypso/state/support/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Stats now lives in wp-admin, which serves the same routes as this section behind
 * `admin.php?page=stats#!`, keyed by blog ID rather than slug. Links to these routes are still
 * in circulation (notifications, emails, bookmarks, the mobile apps' universal links), so send
 * them on to the equivalent wp-admin page. On a Premium Analytics site Jetpack translates the
 * `#!/stats/…` route to the new dashboard, so the redirect doesn't need to know which one runs.
 *
 * Support sessions stay here so Happiness Engineers can compare numbers with the classic page.
 *
 * Kept out of `controller.jsx`, which wp-admin Stats shares.
 */
export default async function redirectToWpAdminStats( context, next ) {
	const state = context.store.getState();

	if ( isSupportSession( state ) ) {
		next();
		return;
	}

	// Without a site in the URL this section shows a site picker, which the Sites list replaces.
	if ( ! context.params.site ) {
		page.redirect( '/sites' );
		return;
	}

	const siteId = getSelectedSiteId( state );
	const statsAdminUrl = getSiteAdminUrl( state, siteId, 'admin.php?page=stats' );

	if ( ! statsAdminUrl ) {
		next();
		return;
	}

	// A Jetpack site with the Stats module off has no wp-admin Stats page; this section offers
	// to switch the module on instead. The module list usually isn't loaded yet on arrival, since
	// this section only asks for it once it renders, so ask here and redirect only when the module
	// is known to be on.
	if ( isJetpackSite( state, siteId ) ) {
		if ( isJetpackModuleActive( state, siteId, 'stats' ) === null ) {
			await context.store.dispatch( fetchModuleList( siteId ) );

			// The user may have moved on while the module list loaded.
			if ( page.current !== context.path ) {
				return;
			}
		}

		if ( isJetpackModuleActive( context.store.getState(), siteId, 'stats' ) !== true ) {
			next();
			return;
		}
	}

	// Every site-scoped route ends in the site, which wp-admin Stats expects as a blog ID.
	const segments = context.pathname.replace( /\/+$/, '' ).split( '/' );
	segments[ segments.length - 1 ] = siteId;
	const query = context.querystring ? `?${ context.querystring }` : '';

	window.location.replace( `${ statsAdminUrl }#!${ segments.join( '/' ) }${ query }` );
}
