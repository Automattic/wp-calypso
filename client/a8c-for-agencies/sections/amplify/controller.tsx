import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import MainSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/main';
import ProspectReports from './primary/prospect-reports';

export const amplifyContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Prospect reports" path={ context.path } />
			<ProspectReports />
		</>
	);
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};
