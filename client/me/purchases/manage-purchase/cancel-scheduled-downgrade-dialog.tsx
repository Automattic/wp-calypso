import { getPlan } from '@automattic/calypso-products';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { ConfirmDialog, DialogContent, DialogFooter } from 'calypso/components/confirm-dialog';
import { cancelScheduledDowngradeAsync } from 'calypso/lib/purchases/actions';
import { useDispatch } from 'calypso/state';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { fetchUserPurchases, fetchSitePurchases } from 'calypso/state/purchases/actions';
import type { Purchase } from 'calypso/lib/purchases/types';

interface CancelScheduledDowngradeDialogProps {
	isVisible: boolean;
	purchase: Purchase;
	onClose: () => void;
	onCancelSuccess?: () => void;
}

export default function CancelScheduledDowngradeDialog( {
	isVisible,
	purchase,
	onClose,
	onCancelSuccess,
}: CancelScheduledDowngradeDialogProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isCanceling, setIsCanceling ] = useState( false );

	if ( ! isVisible ) {
		return null;
	}

	const currentPlanTitle = getPlan( purchase.productSlug )?.getTitle() ?? '';

	const handleConfirm = async () => {
		setIsCanceling( true );
		try {
			await cancelScheduledDowngradeAsync( purchase.id );
			dispatch( fetchUserPurchases() );
			dispatch( fetchSitePurchases( purchase.siteId ) );
			dispatch(
				successNotice( translate( 'Your scheduled downgrade was canceled.' ), {
					duration: 5000,
				} )
			);
			if ( onCancelSuccess ) {
				onCancelSuccess();
			} else {
				onClose();
			}
		} catch ( error ) {
			dispatch(
				errorNotice(
					translate( 'We were unable to cancel the scheduled downgrade. Please try again.' ),
					{ duration: 5000 }
				)
			);
		} finally {
			setIsCanceling( false );
		}
	};

	return (
		<ConfirmDialog
			onRequestClose={ onClose }
			title={ String( translate( 'Keep your current plan?' ) ) }
		>
			<DialogContent>
				{ translate(
					'Your %(plan)s plan will stay active. You can schedule a downgrade again anytime.',
					{ args: { plan: currentPlanTitle } }
				) }
			</DialogContent>
			<DialogFooter>
				<Button variant="tertiary" onClick={ onClose } disabled={ isCanceling }>
					{ translate( 'Not now' ) }
				</Button>
				<Button variant="primary" onClick={ handleConfirm } isBusy={ isCanceling }>
					{ translate( 'Keep my plan' ) }
				</Button>
			</DialogFooter>
		</ConfirmDialog>
	);
}
