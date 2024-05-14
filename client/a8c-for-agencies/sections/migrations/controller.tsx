import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MainSidebar from '../../components/sidebar-menu/main';
import MigrationsOverview from './migrations-overview';

export const migrationsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Migrations" path={ context.path } />
			<MigrationsOverview />
		</>
	);
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};
