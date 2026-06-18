import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import AmplifySidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/amplify';
import AmplifyOverview from './primary/amplify-overview';
import AmplifyReports from './primary/amplify-reports';

export const amplifyOverviewContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Amplify > Overview" path={ context.path } />
			<AmplifyOverview />
		</>
	);
	context.secondary = <AmplifySidebar path={ context.path } />;
	next();
};

export const amplifyReportsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Amplify > Reports" path={ context.path } />
			<AmplifyReports />
		</>
	);
	context.secondary = <AmplifySidebar path={ context.path } />;
	next();
};
