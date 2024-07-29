import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	A4A_REFERRALS_LINK,
	A4A_REFERRALS_BANK_DETAILS_LINK,
	A4A_REFERRALS_COMMISSIONS_LINK,
	A4A_REFERRALS_DASHBOARD,
	A4A_REFERRALS_PAYMENT_SETTINGS,
	A4A_REFERRALS_FAQ,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import * as controller from './controller';

const isAutomatedReferralsEnabled = config.isEnabled( 'a4a-automated-referrals' );

export default function () {
	if ( isAutomatedReferralsEnabled ) {
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
		page( A4A_REFERRALS_LINK, () => page.redirect( A4A_REFERRALS_DASHBOARD ) );
	} else {
		// Remove the following when the automated referrals feature flag is removed
		page(
			A4A_REFERRALS_LINK,
			requireAccessContext,
			controller.referralsContext,
			makeLayout,
			clientRender
		);
		page(
			A4A_REFERRALS_BANK_DETAILS_LINK,
			requireAccessContext,
			controller.referralsBankDetailsContext,
			makeLayout,
			clientRender
		);
		page(
			A4A_REFERRALS_COMMISSIONS_LINK,
			requireAccessContext,
			controller.referralsCommissionOverviewContext,
			makeLayout,
			clientRender
		);
	}
}
