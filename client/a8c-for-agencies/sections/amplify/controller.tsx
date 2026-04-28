import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import MainSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/main';
import AmplifyOverview from './amplify-overview';

export const amplifyContext: Callback = ( context, next ) => {
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Amplify" path={ context.path } />
			<AmplifyOverview />
		</>
	);
	next();
};
