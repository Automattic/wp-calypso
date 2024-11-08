import { isEnabled } from '@automattic/calypso-config';
import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import MigrationsSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/migrations';
import MainSidebar from '../../components/sidebar-menu/main';
import ReferralsBankDetails from '../referrals/primary/bank-details';
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

export const migrationsOverviewContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Migrations > Overview" path={ context.path } />
			<div>Migrations Overview</div>
		</>
	);
	context.secondary = <MigrationsSidebar path={ context.path } />;
	next();
};

export const migrationsCommissionsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Migrations > Commissions" path={ context.path } />
			<div>Migrations Commissions</div>
		</>
	);
	context.secondary = <MigrationsSidebar path={ context.path } />;
	next();
};

export const migrationsPaymentSettingsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Migrations > Payment Settings" path={ context.path } />
			<ReferralsBankDetails isAutomatedReferral />
		</>
	);
	context.secondary = <MigrationsSidebar path={ context.path } />;
	next();
};
