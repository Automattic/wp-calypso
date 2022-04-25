import DashboardOverview from './dashboard-overview';
import Header from './header';
import DashboardSidebar from './sidebar';

export function agencyDashboardContext( context: PageJS.Context, next: () => void ): void {
	context.header = <Header />;
	context.secondary = <DashboardSidebar path={ context.path } />;
	context.primary = <DashboardOverview />;
	next();
}
