import { isEnabled } from '@automattic/calypso-config';
import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import MainSidebar from '../../components/sidebar-menu/main';
import MigrationsOverview from './migrations-overview';
import MigrationsOverviewV2 from './migrations-overview-v2';

export const migrationsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Migrations" path={ context.path } />
			{ isEnabled( 'a4a-migrations-page-v2' ) ? <MigrationsOverviewV2 /> : <MigrationsOverview /> }
		</>
	);
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};
