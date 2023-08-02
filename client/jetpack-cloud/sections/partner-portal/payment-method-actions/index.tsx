import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useRecentPaymentMethodsQuery } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import PaymentMethodDeleteDialog from 'calypso/jetpack-cloud/sections/partner-portal/payment-method-delete-dialog';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { deleteStoredCard } from 'calypso/state/partner-portal/stored-cards/actions';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import type { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	card: PaymentMethod;
}

const PaymentMethodActions: FunctionComponent< Props > = ( { card } ) => {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();

	const [ isDeleteDialogVisible, setIsDeleteDialogVisible ] = useState( false );
	const closeDialog = useCallback( () => setIsDeleteDialogVisible( false ), [] );

	const { data: recentCards } = useRecentPaymentMethodsQuery();

	const nextPrimaryPaymentMethod = ( recentCards?.items || [] ).find(
		( currCard: PaymentMethod ) => currCard.id !== card.id
	);

	const handleDelete = useCallback( () => {
		closeDialog();
		reduxDispatch( deleteStoredCard( card, nextPrimaryPaymentMethod?.id ) )
			.then( () => {
				reduxDispatch( successNotice( translate( 'Payment method deleted successfully' ) ) );

				recordTracksEvent( 'calypso_partner_portal_delete_payment_method' );
			} )
			.catch( ( error: Error ) => {
				reduxDispatch( errorNotice( error.message ) );
			} );
	}, [ closeDialog, card, translate, reduxDispatch, nextPrimaryPaymentMethod?.id ] );

	const renderActions = () => {
		return [
			<PopoverMenuItem key="delete" onClick={ () => setIsDeleteDialogVisible( true ) }>
				{ translate( 'Delete' ) }
			</PopoverMenuItem>,
		];
	};

	return (
		<>
			<PaymentMethodDeleteDialog
				paymentMethod={ card }
				isVisible={ isDeleteDialogVisible }
				onClose={ closeDialog }
				onConfirm={ handleDelete }
			/>

			<EllipsisMenu
				icon={
					<svg
						width="24"
						height="24"
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						aria-hidden="true"
						focusable="false"
					>
						<path d="M13 19h-2v-2h2v2zm0-6h-2v-2h2v2zm0-6h-2V5h2v2z"></path>
					</svg>
				}
				className="payment-method-actions"
				popoverClassName="payment-method-actions__popover"
			>
				{ renderActions() }
			</EllipsisMenu>
		</>
	);
};

export default PaymentMethodActions;
