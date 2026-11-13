import { PLAN_FREE, PLAN_JETPACK_FREE } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { fetchModuleList } from 'calypso/state/jetpack/modules/actions';
import isDIFMLiteInProgress from 'calypso/state/selectors/is-difm-lite-in-progress';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import isSiteMigrationInProgress from 'calypso/state/selectors/is-site-migration-in-progress';
import wasEcommerceTrialSite from 'calypso/state/selectors/was-ecommerce-trial-site';
import wasUpgradedFromTrialSite from 'calypso/state/selectors/was-upgraded-from-trial-site';
import { requestSite } from 'calypso/state/sites/actions';
import {
	getSiteAdminUrl,
	getSiteId,
	getSitePlanSlug,
	isJetpackModuleActive as isJetpackModuleActiveViaSiteOption,
	isJetpackSite,
} from 'calypso/state/sites/selectors';
import { isSupportSession } from 'calypso/state/support/selectors';

/**
 * Whether `siteSelection` keeps the site on a Calypso screen of its own whatever the route: an
 * expired eCommerce trial, a migration in progress, a domain-only site or a DIFM build in progress.
 */
function isHeldOnOwnScreen( state, siteId ) {
	return (
		( wasEcommerceTrialSite( state, siteId ) &&
			! wasUpgradedFromTrialSite( state, siteId ) &&
			[ PLAN_FREE, PLAN_JETPACK_FREE ].includes( getSitePlanSlug( state, siteId ) ) ) ||
		isSiteMigrationInProgress( state, siteId ) ||
		isDomainOnlySite( state, siteId ) ||
		isDIFMLiteInProgress( state, siteId )
	);
}

/**
 * Stats now lives in wp-admin, which serves the same routes as this section behind
 * `admin.php?page=stats#!`, keyed by blog ID rather than slug. Links to these routes are still
 * in circulation (notifications, emails, bookmarks, the mobile apps' universal links), so send
 * them on to the equivalent wp-admin page. On a Premium Analytics site Jetpack translates the
 * `#!/stats/…` route to the new dashboard, so the redirect doesn't need to know which one runs.
 *
 * Support sessions stay here so Happiness Engineers can compare numbers with the classic page.
 *
 * Kept out of `controller.jsx`, which wp-admin Stats shares. Runs before `siteSelection`, so the
 * page the user came from stays up until wp-admin replaces it: selecting the site would first
 * switch Calypso to that site's layout.
 */
export default async function redirectToWpAdminStats( context, next ) {
	const { getState, dispatch } = context.store;

	if ( isSupportSession( getState() ) ) {
		next();
		return;
	}

	// Without a site in the URL this section shows stats across all the user's sites, which
	// wp-admin, being per site, has no page for. Nor does it have a purchase or realtime page.
	if (
		! context.params.site ||
		context.pathname.startsWith( '/stats/purchase' ) ||
		context.pathname.startsWith( '/stats/realtime' )
	) {
		next();
		return;
	}

	let siteId = getSiteId( getState(), context.params.site );

	// Opened directly, the site may not be loaded yet. If it can't be, `siteSelection` handles it.
	if ( ! siteId ) {
		await dispatch( requestSite( context.params.site ) ).catch( () => null );

		if ( page.current !== context.path ) {
			return;
		}

		siteId = getSiteId( getState(), context.params.site );
	}

	const statsAdminUrl = getSiteAdminUrl( getState(), siteId, 'admin.php?page=stats' );

	if ( ! statsAdminUrl || isHeldOnOwnScreen( getState(), siteId ) ) {
		next();
		return;
	}

	// A Jetpack site with the Stats module off has no wp-admin Stats page; this section offers
	// to switch the module on instead. The module list usually isn't loaded yet on arrival, but the
	// site's own list of active modules is. Ask the site for the module list, which can be slow, only
	// when neither is known, and redirect only when the module is known to be on.
	if ( isJetpackSite( getState(), siteId ) ) {
		let isStatsActive =
			isJetpackModuleActive( getState(), siteId, 'stats' ) ??
			isJetpackModuleActiveViaSiteOption( getState(), siteId, 'stats' );

		if ( isStatsActive === null ) {
			await dispatch( fetchModuleList( siteId ) );

			// The user may have moved on while the module list loaded.
			if ( page.current !== context.path ) {
				return;
			}

			isStatsActive = isJetpackModuleActive( getState(), siteId, 'stats' );
		}

		if ( isStatsActive !== true ) {
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
