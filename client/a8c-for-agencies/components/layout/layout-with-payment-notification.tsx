import { ComponentProps } from 'react';
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
			{ children }
		</LayoutTop>
	);
}
