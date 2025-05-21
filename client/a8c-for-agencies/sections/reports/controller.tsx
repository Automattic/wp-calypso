import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import ReportsSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/reports';
import ReportsDashboard from './reports-dashboard';
import ReportsOverview from './reports-overview';

export const reportsDashboardContext: Callback = ( context, next ) => {
	context.secondary = <ReportsSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Reports Dashboard" path={ context.path } />
			<ReportsDashboard />
		</>
	);
	next();
};

export const reportsOverviewContext: Callback = ( context, next ) => {
	context.secondary = <ReportsSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Reports Overview" path={ context.path } />
			<ReportsOverview />
		</>
	);
	next();
};
