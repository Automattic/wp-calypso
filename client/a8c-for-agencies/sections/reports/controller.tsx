import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import MainSidebar from '../../components/sidebar-menu/main';
import ReportsComponent from './reports-component';

export const reportsContext: Callback = ( context, next ) => {
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Reports" path={ context.path } />
			<ReportsComponent />
		</>
	);
	next();
};
