import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import AmplifySidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/amplify';
import AmplifyPage from './amplify-page';

export const amplifyOverviewContext: Callback = ( context, next ) => {
	context.secondary = <AmplifySidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Amplify > Overview" path={ context.path } />
			<AmplifyPage selectedTab="overview" />
		</>
	);
	next();
};

export const amplifyReportsContext: Callback = ( context, next ) => {
	context.secondary = <AmplifySidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Amplify > Reports" path={ context.path } />
			<AmplifyPage selectedTab="reports" />
		</>
	);
	next();
};
