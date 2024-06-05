import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useContext, type FunctionComponent } from 'react';
import { PaymentMethodSummary } from 'calypso/lib/checkout/payment-methods';
import { PaymentMethodOverviewContext } from '../../context';
import useStoredCards from '../../hooks/use-stored-cards';
import DeletePrimaryCardConfirmation from './delete-primary-confirmation';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';

import './style.scss';

interface Props {
	paymentMethod: PaymentMethod;
	isVisible: boolean;
	onClose: () => void;
	onConfirm: () => void;
	isDeleteInProgress?: boolean;
}

const StoredCreditCardDeleteDialog: FunctionComponent< Props > = ( {
	paymentMethod,
	isVisible,
	onClose,
	onConfirm,
	isDeleteInProgress,
} ) => {
	const translate = useTranslate();

	const { paging } = useContext( PaymentMethodOverviewContext );

	// Fetch the stored cards from the cache if they are available.
	const {
		data: { allStoredCards },
		isFetching,
	} = useStoredCards( paging, true );

	return (
		<Dialog
			isVisible={ isVisible }
			additionalClassNames="stored-credit-card-delete-dialog"
			onClose={ onClose }
			buttons={ [
				<Button disabled={ false } onClick={ onClose }>
					{ translate( 'Go back' ) }
				</Button>,

				<Button
					busy={ isDeleteInProgress }
					disabled={ isDeleteInProgress }
					onClick={ onConfirm }
					primary
					scary
				>
					{ translate( 'Delete payment method' ) }
				</Button>,
			] }
		>
			<h2 className="stored-credit-card-delete-dialog__heading">
				{ translate( 'Delete payment method' ) }
			</h2>

			<p>
				{ translate(
					'The payment method {{paymentMethodSummary/}} will be removed from your account',
					{
						components: {
							paymentMethodSummary: (
								<strong>
									<PaymentMethodSummary
										type={ paymentMethod?.card.brand }
										digits={ paymentMethod?.card.last4 }
									/>
								</strong>
							),
						},
					}
				) }
			</p>

			{ paymentMethod.is_default && (
				<DeletePrimaryCardConfirmation
					card={ paymentMethod.card }
					altCard={
						( allStoredCards || [] ).find( ( card: PaymentMethod ) => card.id !== paymentMethod.id )
							?.card
					}
					isFetching={ isFetching }
				/>
			) }
		</Dialog>
	);
};

export default StoredCreditCardDeleteDialog;
