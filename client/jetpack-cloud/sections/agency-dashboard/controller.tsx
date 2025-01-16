import { recordTracksEvent } from '@automattic/calypso-analytics';
import page, { type Callback } from '@automattic/calypso-router';
import JetpackManageSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/jetpack-manage';
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

	const currentPage = parseInt( contextPage ) || 1;

	context.header = <Header />;
	context.secondary = <JetpackManageSidebar path={ context.path } />;
	context.primary = (
		<DashboardOverview
			path={ context.path }
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

export const connectUrlContext: Callback = ( context, next ) => {
	context.header = <Header />;
	context.secondary = <JetpackManageSidebar path={ context.path } />;
	context.primary = <ConnectUrl />;
	next();
};
