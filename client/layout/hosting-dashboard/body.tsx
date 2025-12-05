import clsx from 'clsx';
import { ReactNode } from 'react';
import PendingPaymentNotification from 'calypso/a8c-for-agencies/components/pending-payment-notification';

type Props = {
	children: ReactNode;
	className?: string;
	isFullWidth?: boolean;
	notices?: ReactNode;
	hidePendingPaymentNotification?: boolean;
};

export default function LayoutBody( {
	children,
	className,
	isFullWidth,
	notices,
	hidePendingPaymentNotification,
}: Props ) {
	const wrapperClass = clsx( className, 'hosting-dashboard-layout__body' );

	const hasNotices = !! notices || ! hidePendingPaymentNotification;

	return (
		<div className={ wrapperClass }>
			{ hasNotices && (
				<div className="hosting-dashboard-layout__body-notices">
					{ ! hidePendingPaymentNotification && (
						<PendingPaymentNotification isFullWidth={ isFullWidth } />
					) }
					{ notices }
				</div>
			) }
			<div className="hosting-dashboard-layout__body-wrapper">{ children }</div>
		</div>
	);
}
