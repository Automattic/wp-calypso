import config from '@automattic/calypso-config';
import page, { type Callback } from '@automattic/calypso-router';
import JetpackManageSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/jetpack-manage';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
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
	};
	const sort = {
		field: sort_field,
		direction: sort_direction,
	};
	const state = context.store.getState();
	const isAgency = isAgencyUser( state );
	const isAgencyEnabled = config.isEnabled( 'jetpack/agency-dashboard' );
	if ( ! isAgency || ! isAgencyEnabled ) {
		if ( origin === 'wp-admin' ) {
			window.location.href = 'https://jetpack.com/manage/';
			return;
		}
		return page.redirect( '/' );
	}

	const currentPage = parseInt( contextPage ) || 1;
	context.header = <Header />;
	context.secondary = <JetpackManageSidebar path={ context.path } />;
	context.primary = (
		<DashboardOverview
			search={ search }
			currentPage={ currentPage }
			filter={ filter }
			sort={ sort }
		/>
	);

	// By definition, Sites Management does not select any one specific site
	context.store.dispatch( setAllSitesSelected() );

	next();
};
