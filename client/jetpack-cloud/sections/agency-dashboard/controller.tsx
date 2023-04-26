import config from '@automattic/calypso-config';
import page from 'page';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import DashboardOverview from './dashboard-overview';
import Header from './header';
import DashboardSidebar from './sidebar';

export function agencyDashboardContext( context: PageJS.Context, next: VoidFunction ): void {
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
	context.secondary = <DashboardSidebar path={ context.path } />;
	context.primary = (
		<DashboardOverview
			search={ search }
			currentPage={ currentPage }
			filter={ filter }
			sort={ sort }
		/>
	);
	next();
}
