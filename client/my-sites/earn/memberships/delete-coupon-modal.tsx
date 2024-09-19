import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch, useSelector } from 'calypso/state';
import { requestDeleteCoupon } from 'calypso/state/memberships/coupon-list/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Coupon } from '../types';

type RecurringPaymentsCouponDeleteModalProps = {
	closeDialog: () => void;
	coupon: Coupon;
};

const RecurringPaymentsCouponDeleteModal = ( {
	closeDialog,
	coupon,
}: RecurringPaymentsCouponDeleteModalProps ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const dispatch = useDispatch();

	const onClose = ( action?: string ) => {
		if ( action === 'delete' ) {
			dispatch(
				requestDeleteCoupon(
					siteId,
					coupon,
					translate( '"%s" was deleted.', { args: coupon.coupon_code } )
				)
			);
		}
		closeDialog();
	};

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
			<h1>{ translate( 'Delete coupon?' ) }</h1>
			<p>
				{ translate(
					'Deleting this coupon ({{strong}}%s{{/strong}}) will prevent coupon holders from applying coupon at checkout.',
					{
						args: coupon?.coupon_code,
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
		</Dialog>
	);
};

export default RecurringPaymentsCouponDeleteModal;
