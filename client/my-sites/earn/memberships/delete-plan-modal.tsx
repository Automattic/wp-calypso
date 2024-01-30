import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
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

	const onClose = ( action?: string ) => {
		if ( action === 'delete' ) {
			dispatch(
				requestDeleteProduct(
					siteId,
					product,
					annualProduct,
					translate( '"%s" was deleted.', { args: product.title } )
				)
			);
		}
		closeDialog();
	};

	return (
		<Dialog
			isVisible={ true }
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
					'Deleting this offering ({{strong}}%s{{/strong}}) will not affect existing subscribers, which means they will continue to be charged. You can cancel existing subscriptions on the Supporters screen.',
					{
						args: product?.title,
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
		</Dialog>
	);
};

export default RecurringPaymentsPlanDeleteModal;
