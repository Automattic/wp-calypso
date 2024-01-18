import { createHigherOrderComponent } from '@wordpress/compose';
import { WithAtomicTransfer } from './with-atomic-transfer';

export const WithAtomicTransferHOC = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const atomicTransfer = WithAtomicTransfer( props );
		return <Wrapped { ...props } atomicTransfer={ atomicTransfer } />;
	},
	'WithAtomicTransferHOC'
);
