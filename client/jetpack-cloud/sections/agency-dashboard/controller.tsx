import DashboardOverview from './dashboard-overview';
import Header from './header';
import DashboardSidebar from './sidebar';

export function agencyDashboardContext( context: PageJS.Context, next: () => void ): void {
	const { s: search, page, issue_types } = context.query;
	const filter = {
		issueTypes: issue_types?.split( ',' ),
		showOnlyFavorites: context.params.filter === 'favorites',
	};
	const currentPage = parseInt( page ) || 1;
	context.header = <Header />;
	context.secondary = <DashboardSidebar path={ context.path } />;
	context.primary = (
		<DashboardOverview search={ search } currentPage={ currentPage } filter={ filter } />
	);
	next();
}
