import clsx from 'clsx';
import { Children, ReactNode } from 'react';
import PendingPaymentNotification from 'calypso/a8c-for-agencies/components/pending-payment-notification';
import LayoutNavigation from './nav';

type Props = {
	children: ReactNode;
	withNavigation?: boolean;
};

export default function LayoutTop( { children, withNavigation }: Props ) {
	const navigation = Children.toArray( children ).find(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( child: any ) => child.type === LayoutNavigation
	);

	return (
		<div
			className={ clsx( 'multi-sites-dashboard-layout__top-wrapper', {
				'has-navigation': withNavigation || !! navigation,
			} ) }
		>
			<PendingPaymentNotification />
			{ children }
		</div>
	);
}
