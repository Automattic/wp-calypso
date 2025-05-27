import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import ReportsSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/reports';
import BuildReport from './build-report';
import ExampleReport from './example-report';
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

export const buildReportContext: Callback = ( context, next ) => {
	context.secondary = <ReportsSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Build Report" path={ context.path } />
			<BuildReport />
		</>
	);
	next();
};

export const exampleReportContext: Callback = ( context, next ) => {
	context.secondary = <ReportsSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Example Report" path={ context.path } />
			<ExampleReport />
		</>
	);
	next();
};
