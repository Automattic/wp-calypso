import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	A4A_MIGRATIONS_LINK,
	A4A_MIGRATIONS_OVERVIEW_LINK,
	A4A_MIGRATIONS_MIGRATE_TO_PRESSABLE_LINK,
	A4A_MIGRATIONS_MIGRATE_TO_WPCOM_LINK,
	A4A_MIGRATIONS_COMMISSIONS_LINK,
	A4A_MIGRATIONS_PAYMENT_SETTINGS,
	A4A_MIGRATIONS_IMPORT_SITE_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import * as controller from './controller';

export default function () {
	page(
		A4A_MIGRATIONS_OVERVIEW_LINK,
		requireAccessContext,
		controller.migrationsOverviewContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_MIGRATIONS_MIGRATE_TO_PRESSABLE_LINK,
		requireAccessContext,
		controller.migrateToPressableContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_MIGRATIONS_MIGRATE_TO_WPCOM_LINK,
		requireAccessContext,
		controller.migrateToWpcomContext,
		makeLayout,
		clientRender
	);
	if ( config.isEnabled( 'a4a/static-site-import' ) ) {
		page(
			A4A_MIGRATIONS_IMPORT_SITE_LINK,
			requireAccessContext,
			controller.importSiteContext,
			makeLayout,
			clientRender
		);
	}
	page(
		A4A_MIGRATIONS_COMMISSIONS_LINK,
		requireAccessContext,
		controller.migrationsCommissionsContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_MIGRATIONS_PAYMENT_SETTINGS,
		requireAccessContext,
		controller.migrationsPaymentSettingsContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_MIGRATIONS_LINK,
		requireAccessContext,
		controller.migrationsLandingContext,
		makeLayout,
		clientRender
	);
}
