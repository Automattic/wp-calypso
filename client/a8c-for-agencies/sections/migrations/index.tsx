import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	A4A_MIGRATIONS_LINK,
	A4A_MIGRATIONS_OVERVIEW_LINK,
	A4A_MIGRATIONS_MIGRATE_TO_PRESSABLE_LINK,
	A4A_MIGRATIONS_MIGRATE_TO_WPCOM_LINK,
	A4A_MIGRATIONS_COMMISSIONS_LINK,
	A4A_MIGRATIONS_PAYMENT_SETTINGS,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import * as controller from './controller';

export default function () {
	if ( isEnabled( 'a4a-tracking-site-migrations' ) ) {
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
		page( A4A_MIGRATIONS_LINK, () => page.redirect( A4A_MIGRATIONS_OVERVIEW_LINK ) );
	} else {
		page(
			A4A_MIGRATIONS_LINK,
			requireAccessContext,
			controller.migrationsContext,
			makeLayout,
			clientRender
		);
	}
}
