import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MainSidebar from '../../components/sidebar-menu/main';
import Overview from './overview';

export const overviewContext: Callback = ( context, next ) => {
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Overview" path={ context.path } />
			<Overview />
		</>
	);

	next();
};
