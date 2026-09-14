import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import type { PaymentNoticeSeverity } from 'calypso/state/a8c-for-agencies/types';

import './style.scss';

type PaymentRiskNoticeMenuIndicatorProps = {
	severity: PaymentNoticeSeverity;
};

export default function PaymentRiskNoticeMenuIndicator( {
	severity,
}: PaymentRiskNoticeMenuIndicatorProps ) {
	const translate = useTranslate();

	return (
		<span
			aria-label={ translate( 'Payment issue' ) }
			className={ clsx( 'a4a-payment-risk-notice-menu-indicator', {
				'a4a-payment-risk-notice-menu-indicator--error': severity === 'error',
				'a4a-payment-risk-notice-menu-indicator--warning': severity === 'warning',
			} ) }
			role="img"
		>
			!
		</span>
	);
}
