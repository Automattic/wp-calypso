import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';
import { A4A_WOOPAYMENTS_PAYMENT_SETTINGS_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useGetTipaltiPayee from '../../referrals/hooks/use-get-tipalti-payee';

import './style.scss';

export const MissingPaymentSettingsNotice = () => {
	const translate = useTranslate();

	const { data: tipaltiData } = useGetTipaltiPayee();
	const isPayable = tipaltiData?.IsPayable;

	if ( isPayable ) {
		return null;
	}

	return (
		<LayoutBanner
			level="warning"
			title={ translate( 'Add your payment information to get paid' ) }
			className="missing-payment-settings-notice"
			hideCloseButton
		>
			<div>{ translate( 'To receive your revenue share, add your payment information.' ) }</div>
			<Button
				className="missing-payment-settings-notice__button is-dark"
				href={ A4A_WOOPAYMENTS_PAYMENT_SETTINGS_LINK }
			>
				{ translate( 'Add your payment information' ) }
			</Button>
		</LayoutBanner>
	);
};

export default MissingPaymentSettingsNotice;
