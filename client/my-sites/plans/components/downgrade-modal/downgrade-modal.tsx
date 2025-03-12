import { getPlan } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { Modal, Button } from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { cancelAndRefundPurchaseAsync } from 'calypso/lib/purchases/actions';
import { useSelector, useDispatch } from 'calypso/state';
import { closeDowngradeModal } from 'calypso/state/downgrade-modal/actions';
import {
	getDowngradeModalToPlanSlug,
	isDowngradeModalOpen,
} from 'calypso/state/downgrade-modal/selectors';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { refreshSitePlans } from 'calypso/state/sites/plans/actions';
import { getSitePlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const DowngradeModal = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isVisible = useSelector( isDowngradeModalOpen );
	const toPlanSlug = useSelector( getDowngradeModalToPlanSlug );
	const siteId = useSelector( getSelectedSiteId );
	const currentPlan = useSelector( ( state ) => getSitePlan( state, siteId ) );

	const handleClose = useCallback( () => {
		dispatch( closeDowngradeModal() );
	}, [ dispatch ] );

	const handleDowngrade = useCallback( async () => {
		if ( ! currentPlan?.purchaseId || ! currentPlan?.productId || ! toPlanSlug ) {
			return;
		}

		try {
			const response = await cancelAndRefundPurchaseAsync( currentPlan.purchaseId, {
				product_id: currentPlan.productId,
				type: 'downgrade',
				to_product_id: getPlan( toPlanSlug )?.getProductId(),
			} );

			// Show success notification
			dispatch( successNotice( response.message, { duration: 5000 } ) );

			// Refresh site plans to update the UI with the new plan
			if ( siteId ) {
				dispatch( refreshSitePlans( siteId ) );
			}
		} catch ( error: unknown ) {
			if ( error instanceof Error ) {
				dispatch( errorNotice( error.message, { duration: 5000 } ) );
			} else {
				dispatch( errorNotice( translate( 'An unknown error occurred' ), { duration: 5000 } ) );
			}
		} finally {
			// Close the modal after all operations are complete
			handleClose();
		}
	}, [ currentPlan, toPlanSlug, siteId, dispatch, translate, handleClose ] );

	if ( ! isVisible ) {
		return null;
	}

	// Get the target plan name for the modal title
	const targetPlan = toPlanSlug ? getPlan( toPlanSlug ) : null;
	const targetPlanName = targetPlan?.getTitle() || toPlanSlug || '';
	const modalTitle = translate( 'Back to plan %s', { args: [ targetPlanName ] } ) as string;

	return (
		<Modal title={ modalTitle } onRequestClose={ handleClose } overlayClassName="downgrade-modal">
			<Notice
				className="downgrade-modal__notice"
				icon={ <Gridicon icon="info" /> }
				isCompact
				theme="light"
				status="is-info"
				showDismiss={ false }
			>
				<span className="downgrade-modal__notice-text">
					{ translate(
						'Are you sure you want to downgrade your plan? This action cannot be undone.'
					) }
				</span>
			</Notice>
			<div className="downgrade-modal__actions">
				<Button variant="secondary" onClick={ handleClose }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button variant="primary" onClick={ handleDowngrade } isPrimary>
					{ translate( 'Downgrade' ) }
				</Button>
			</div>
		</Modal>
	);
};

export default DowngradeModal;
