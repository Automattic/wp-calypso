import { ComponentProps } from 'react';
import EmailVerificationNotification from 'calypso/a8c-for-agencies/components/email-verification-notification';
import PendingPaymentNotification from 'calypso/a8c-for-agencies/components/pending-payment-notification';
import LayoutTop from 'calypso/layout/hosting-dashboard/top';

import './style.scss';

export default function LayoutWithPaymentNotification( {
	children,
	withNavigation,
	isFullWidth,
}: ComponentProps< typeof LayoutTop > & { isFullWidth?: boolean } ) {
	return (
		<LayoutTop withNavigation={ withNavigation }>
			<PendingPaymentNotification isFullWidth={ isFullWidth } />
			<EmailVerificationNotification isFullWidth={ isFullWidth } />
			{ children }
		</LayoutTop>
	);
}
