import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import LayoutBanner from 'calypso/a8c-for-agencies/components/layout/banner';

import './style.scss';

type Props = {
	onClose: () => void;
};

export const MissingPaymentSettingsNotice = ( { onClose }: Props ) => {
	const translate = useTranslate();
	return (
		<LayoutBanner
			level="warning"
			title={ translate( 'Your payment settings require action' ) }
			onClose={ onClose }
			className="missing-payment-settings-notice"
		>
			<div>
				{ translate( 'Please confirm your details before referring products to your clients.' ) }
			</div>
			<Button
				className="missing-payment-settings-notice__button is-dark"
				href="/referrals/payment-settings"
			>
				{ translate( 'Go to payment settings' ) }
			</Button>
		</LayoutBanner>
	);
};

export default MissingPaymentSettingsNotice;
