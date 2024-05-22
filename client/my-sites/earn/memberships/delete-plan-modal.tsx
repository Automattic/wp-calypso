import { Dialog, FormLabel } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormInputCheckbox from 'calypso/components/forms/form-checkbox';
import { useDispatch, useSelector } from 'calypso/state';
import { requestDeleteProduct } from 'calypso/state/memberships/product-list/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Product } from '../types';

type RecurringPaymentsPlanDeleteModalProps = {
	closeDialog: () => void;
	product: Product;
	annualProduct: Product | null;
};

const RecurringPaymentsPlanDeleteModal = ( {
	closeDialog,
	product,
	annualProduct,
}: RecurringPaymentsPlanDeleteModalProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();
	const [ cancelSubscriptions, setCancelSubscriptions ] = useState( false );

	const onClose = ( action?: string ) => {
		if ( action === 'delete' ) {
			dispatch(
				requestDeleteProduct(
					siteId,
					product,
					annualProduct,
					translate( '"%s" was deleted.', { args: product.title } ),
					cancelSubscriptions
				)
			);
		}
		closeDialog();
	};

	// Cancel the subscription for existing subscribers
	return (
		<Dialog
			isVisible
			className="memberships__delete-plan-modal"
			buttons={ [
				{
					label: translate( 'Cancel' ),
					action: 'cancel',
				},
				{
					label: translate( 'Delete' ),
					isPrimary: true,
					additionalClassNames: 'is-scary',
					action: 'delete',
				},
			] }
			onClose={ onClose }
		>
			<h1>{ translate( 'Delete offering?' ) }</h1>
			<p>
				{ translate(
					"Deleting this offering ({{strong}}%s{{/strong}}) won't affect existing subscribers, which means they'll continue to be charged. If you want to cancel existing subscriptions altogether, please check the box below.",
					{
						args: product?.title,
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<p>
				<FormLabel htmlFor="toggle">
					<FormInputCheckbox
						id="toggle"
						onClick={ () => setCancelSubscriptions( ! cancelSubscriptions ) }
					/>
					<span>{ translate( 'Cancel the subscription for existing subscribers' ) }</span>
				</FormLabel>
			</p>
		</Dialog>
	);
};

export default RecurringPaymentsPlanDeleteModal;
