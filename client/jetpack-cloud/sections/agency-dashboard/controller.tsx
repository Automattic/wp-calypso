import { recordTracksEvent } from '@automattic/calypso-analytics';
import page, { type Callback } from '@automattic/calypso-router';
import JetpackManageSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/jetpack-manage';
import SitesSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/sites';
import { sitesPath } from 'calypso/lib/jetpack/paths';
import { isSectionNameEnabled } from 'calypso/sections-filter';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import ConnectUrl from './connect-url';
import DashboardOverview from './dashboard-overview';
import Header from './header';

export const agencyDashboardContext: Callback = ( context, next ) => {
	const {
		s: search,
		page: contextPage,
		issue_types,
		sort_field,
		sort_direction,
		origin,
	} = context.query;
	const filter = {
		issueTypes: issue_types?.split( ',' ),
		showOnlyFavorites: context.params.filter === 'favorites',
		showOnlyDevelopmentSites: context.params.filter === 'development',
	};
	const sort = {
		field: sort_field,
		direction: sort_direction,
	};
	const state = context.store.getState();
	const isAgency = isAgencyUser( state );
	if ( ! isAgency ) {
		// Redirect to Jetpack.com if the user is not an agency user & the origin is wp-admin
		if ( origin === 'wp-admin' ) {
			recordTracksEvent( 'calypso_jetpack_manage_redirect_to_manage_in_jetpack_dot_com' );
			window.location.href = 'https://jetpack.com/manage/';
			return;
		}
		return page.redirect( '/' );
	}

	const showSitesDashboardV2 =
		isSectionNameEnabled( 'jetpack-cloud-agency-sites-v2' ) &&
		context.section.paths[ 0 ] === sitesPath();

	// TODO: This insert dynamically into the body the class sites-dashboard-v2 to be able to modify some styles outside
	//  of the SitesDashboardV2 context. This way it won't affect the current styles in any context (dev, staging, production).
	if ( showSitesDashboardV2 && ! document.body.classList.contains( 'sites-dashboard-v2' ) ) {
		document.body.classList.add( 'is-sites-dashboard-v2' );
	}

	const currentPage = parseInt( contextPage ) || 1;

	context.header = <Header />;
	context.secondary = showSitesDashboardV2 ? (
		<SitesSidebar path={ context.path } />
	) : (
		<JetpackManageSidebar path={ context.path } />
	);
	context.primary = (
		<DashboardOverview
			path={ context.path }
			search={ search }
			currentPage={ currentPage }
			filter={ filter }
			sort={ sort }
			showSitesDashboardV2={ showSitesDashboardV2 }
		/>
	);

	// By definition, Sites Management does not select any one specific site
	context.store.dispatch( setAllSitesSelected() );

	next();
};

export const connectUrlContext: Callback = ( context, next ) => {
	context.header = <Header />;
	context.secondary = <JetpackManageSidebar path={ context.path } />;
	context.primary = <ConnectUrl />;
	next();
};
