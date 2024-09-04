import { useTranslate } from 'i18n-calypso';
import { useContext, type FunctionComponent } from 'react';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
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

	if ( ! isVisible ) {
		return null;
	}

	return (
		<A4AConfirmationDialog
			className="stored-credit-card-delete-dialog"
			title={ translate( 'Delete payment method' ) }
			onClose={ onClose }
			onConfirm={ onConfirm }
			ctaLabel={ translate( 'Delete payment method' ) }
			closeLabel={ translate( 'Go back' ) }
			busy={ isDeleteInProgress }
			scary
		>
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
		</A4AConfirmationDialog>
	);
};

export default StoredCreditCardDeleteDialog;
