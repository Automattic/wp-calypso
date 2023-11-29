import config from '@automattic/calypso-config';
import page, { type Callback } from '@automattic/calypso-router';
import JetpackManageSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/jetpack-manage';
import { SitesDashboard } from 'calypso/sites-dashboard/components/sites-dashboard';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import DashboardOverview from './dashboard-overview';
import Header from './header';

export const agencyDashboardContext: Callback = ( context, next ) => {
	const { s: search, page: contextPage, issue_types, sort_field, sort_direction } = context.query;
	const filter = {
		issueTypes: issue_types?.split( ',' ),
		showOnlyFavorites: context.params.filter === 'favorites',
	};
	const sort = {
		field: sort_field,
		direction: sort_direction,
	};
	const state = context.store.getState();
	const isAgency = isAgencyUser( state );
	const isAgencyEnabled = config.isEnabled( 'jetpack/agency-dashboard' );
	if ( ! isAgency || ! isAgencyEnabled ) {
		return page.redirect( '/' );
	}

	const currentPage = parseInt( contextPage ) || 1;
	context.header = <Header />;
	context.secondary = <JetpackManageSidebar path={ context.path } />;
	context.primary = (
		<SitesDashboard
			queryParams={ {
				page: context.query.page ? parseInt( context.query.page ) : undefined,
				perPage: context.query[ 'per-page' ] ? parseInt( context.query[ 'per-page' ] ) : undefined,
				search: context.query.search,
				status: context.query.status,
				newSiteID: parseInt( context.query[ 'new-site' ] ) || undefined,
			} }
		/>
	);

	// By definition, Sites Management does not select any one specific site
	context.store.dispatch( setAllSitesSelected() );

	next();
};
