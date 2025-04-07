import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import useFetchReferrals from '../../hooks/use-fetch-referrals';
import useGetTipaltiPayee from '../../hooks/use-get-tipalti-payee';

import './style.scss';

export const MissingPaymentSettingsNotice = () => {
	const translate = useTranslate();

	const { data: tipaltiData } = useGetTipaltiPayee();
	const isPayable = tipaltiData?.IsPayable;

	const { data: referrals } = useFetchReferrals();

	const hasReferrals = !! referrals?.length;

	if ( isPayable || ! hasReferrals ) {
		return null;
	}

	return (
		<LayoutBanner
			level="warning"
			title={ translate( 'Add your payment information to get paid' ) }
			className="missing-payment-settings-notice"
			hideCloseButton
		>
			<div>
				{ translate(
					"You've successfully made a client referral and will be due future commissions. Add your payment details to get paid."
				) }
			</div>
			<Button
				className="missing-payment-settings-notice__button is-dark"
				href="/referrals/payment-settings"
			>
				{ translate( 'Add your payment information' ) }
			</Button>
		</LayoutBanner>
	);
};

export default MissingPaymentSettingsNotice;
