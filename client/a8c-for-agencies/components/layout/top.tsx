import clsx from 'clsx';
import { Children, ReactNode } from 'react';
import PendingPaymentNotification from '../pending-payment-notification';
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
			className={ clsx( 'a4a-layout__top-wrapper', {
				'has-navigation': withNavigation || !! navigation,
			} ) }
		>
			<PendingPaymentNotification />
			{ children }
		</div>
	);
}
