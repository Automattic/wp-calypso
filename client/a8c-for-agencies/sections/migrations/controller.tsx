import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import MigrationsSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/migrations';
import ReferralsBankDetails from '../referrals/primary/bank-details';
import MigrationsCommissions from './primary/migrations-commissions';
import MigrationsOverviewV2 from './primary/migrations-overview-v2';
import SelfMigrationTool from './primary/self-migration-tool';

export const migrationsOverviewContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Migrations > Overview" path={ context.path } />
			<MigrationsOverviewV2 />
		</>
	);
	context.secondary = <MigrationsSidebar path={ context.path } />;
	next();
};

export const migrateToPressableContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Migrations > Migrate to Pressable" path={ context.path } />
			<SelfMigrationTool type="pressable" />
		</>
	);
	context.secondary = <MigrationsSidebar path={ context.path } />;
	next();
};

export const migrateToWpcomContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Migrations > Migrate to WordPress.com" path={ context.path } />
			<SelfMigrationTool type="wpcom" />
		</>
	);
	context.secondary = <MigrationsSidebar path={ context.path } />;
	next();
};

export const migrationsCommissionsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Migrations > Commissions" path={ context.path } />
			<MigrationsCommissions />
		</>
	);
	context.secondary = <MigrationsSidebar path={ context.path } />;
	next();
};

export const migrationsPaymentSettingsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Migrations > Payment Settings" path={ context.path } />
			<ReferralsBankDetails isAutomatedReferral isMigrations />
		</>
	);
	context.secondary = <MigrationsSidebar path={ context.path } />;
	next();
};
