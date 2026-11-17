import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import MainSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/main';
import { NEW_REPORT_ACTION } from 'calypso/dashboard/agency/amplify/constants';
import ProspectReports from './primary/prospect-reports';

export const amplifyContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Prospect reports" path={ context.path } />
			<ProspectReports isNewReportRequested={ context.query.action === NEW_REPORT_ACTION } />
		</>
	);
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};
