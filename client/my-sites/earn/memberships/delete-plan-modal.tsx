import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
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
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
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
			buttons={ [
				{
					label: translate( 'Cancel' ),
					action: 'cancel',
				},
				{
					label: translate( 'Delete' ),
					isPrimary: true,
					action: 'delete',
				},
			] }
			onClose={ onClose }
		>
			<h1>{ translate( 'Confirmation' ) }</h1>
			<p>
				{ translate( 'Do you want to delete "%s"?', {
					args: product?.title,
				} ) }
			</p>
			<Notice
				text={ translate(
					'Deleting a product does not cancel the subscription for existing subscribers.{{br/}}They will continue to be charged even after you delete it.',
					{ components: { br: <br /> } }
				) }
				showDismiss={ false }
			/>
		</Dialog>
	);
};

export default RecurringPaymentsPlanDeleteModal;
