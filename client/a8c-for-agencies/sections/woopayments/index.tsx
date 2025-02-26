import page from '@automattic/calypso-router';
import {
	A4A_WOOPAYMENTS_DASHBOARD_LINK,
	A4A_WOOPAYMENTS_LINK,
	A4A_WOOPAYMENTS_PAYMENT_SETTINGS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { woopaymentsDashboardContext, woopaymentsPaymentSettingsContext } from './controller';

export default function () {
	page(
		A4A_WOOPAYMENTS_DASHBOARD_LINK,
		requireAccessContext,
		woopaymentsDashboardContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_WOOPAYMENTS_PAYMENT_SETTINGS_LINK,
		requireAccessContext,
		woopaymentsPaymentSettingsContext,
		makeLayout,
		clientRender
	);
	page( A4A_WOOPAYMENTS_LINK, () => page.redirect( A4A_WOOPAYMENTS_DASHBOARD_LINK ) );
}
