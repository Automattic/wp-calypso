import page from '@automattic/calypso-router';
import {
	A4A_REFERRALS_LINK,
	A4A_REFERRALS_BANK_DETAILS_LINK,
	A4A_REFERRALS_COMMISSIONS_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import { requireAccessContext } from 'calypso/a8c-for-agencies/controller';
import { makeLayout, render as clientRender } from 'calypso/controller';
import * as controller from './controller';

export default function () {
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
