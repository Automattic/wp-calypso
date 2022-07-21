import Header from '../agency-dashboard/header';
import DashboardSidebar from '../agency-dashboard/sidebar';
import PluginsOverview from './plugins-overview';

export function pluginManagementContext( context: PageJS.Context, next: VoidFunction ): void {
	context.header = <Header />;
	context.secondary = <DashboardSidebar path={ context.path } />;
	context.primary = <PluginsOverview />;
	next();
}
