import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { A4A_REFERRALS_PAYMENT_SETTINGS } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useGetTipaltiPayee from '../../hooks/use-get-tipalti-payee';

import './style.scss';

type CommissionType = 'referrals' | 'migrations' | 'woopayments';

export const MissingPaymentSettingsNotice = ( {
	commissionType,
}: {
	commissionType?: CommissionType;
} ) => {
	const translate = useTranslate();

	const { data: tipaltiData, isSuccess: isDataReady } = useGetTipaltiPayee();
	const isPayable = tipaltiData?.IsPayable;

	const getDescription = () => {
		switch ( commissionType ) {
			case 'referrals':
				return translate(
					'You’ve successfully made a client referral and will be due future commissions. Add your payment details to get paid.'
				);
			case 'migrations':
				return translate(
					'You have successfully migrated a site and will be due future commissions. Add your payment details to get paid.'
				);
			case 'woopayments':
				return translate(
					'Ensure you receive your share of revenue by providing your payout details in the payout settings screen.'
				);
			default:
				return translate(
					'Ensure you receive your share of revenue by providing your payout details in the payout settings screen.'
				);
		}
	};

	if ( isDataReady && ! isPayable ) {
		return (
			<LayoutBanner
				isFullWidth
				level="warning"
				title={ translate( 'Add your payout information to get paid.' ) }
				className="missing-payment-settings-notice"
				allowTemporaryDismissal
				preferenceName="missing-payment-settings-notice-dismissed"
				hideCloseButton
			>
				<div>{ getDescription() }</div>
				<Button
					className="missing-payment-settings-notice__button is-dark"
					href={ commissionType ? 'payment-settings' : A4A_REFERRALS_PAYMENT_SETTINGS }
				>
					{ translate( 'Add payout information now' ) }
				</Button>
			</LayoutBanner>
		);
	}

	return null;
};

export default MissingPaymentSettingsNotice;
