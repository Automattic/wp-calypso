import page from '@automattic/calypso-router';
import {
	A4A_REFERRALS_LINK,
	A4A_REFERRALS_DASHBOARD,
	A4A_REFERRALS_PAYMENT_SETTINGS,
	A4A_REFERRALS_FAQ,
	A4A_REFERRALS_ARCHIVED,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import * as controller from './controller';

export default function () {
	page(
		A4A_REFERRALS_DASHBOARD,
		requireAccessContext,
		controller.referralsDashboardContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_REFERRALS_PAYMENT_SETTINGS,
		requireAccessContext,
		controller.referralsPaymentSettingsContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_REFERRALS_FAQ,
		requireAccessContext,
		controller.referralsFAQContext,
		makeLayout,
		clientRender
	);
	page(
		A4A_REFERRALS_ARCHIVED,
		requireAccessContext,
		controller.referralsArchivedContext,
		makeLayout,
		clientRender
	);
	page( A4A_REFERRALS_LINK, () => page.redirect( A4A_REFERRALS_DASHBOARD ) );
}
