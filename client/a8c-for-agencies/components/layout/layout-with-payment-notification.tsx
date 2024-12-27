import { ComponentProps } from 'react';
import PendingPaymentNotification from 'calypso/a8c-for-agencies/components/pending-payment-notification';
import LayoutTop from 'calypso/layout/hosting-dashboard/top';

export default function LayoutWithPaymentNotification( {
	children,
	withNavigation,
}: ComponentProps< typeof LayoutTop > ) {
	return (
		<LayoutTop withNavigation={ withNavigation }>
			<PendingPaymentNotification />
			{ children }
		</LayoutTop>
	);
}
