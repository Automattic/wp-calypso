import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import useSiteIntent from '../site-intent/use-site-intent';
import { useHasSeenSellerCelebrationModal } from './has-seen-seller-celebration-modal-context';
import useHasSelectedPaymentBlockOnce from './use-has-selected-payment-block-once';

const useShouldShowSellerCelebrationModal = () => {
	const [ shouldShowSellerCelebrationModal, setShouldShowSellerCelebrationModal ] =
		useState( false );

	const { siteIntent: intent } = useSiteIntent();
	const hasSelectedPaymentsOnce = useHasSelectedPaymentBlockOnce();

	const { hasSeenSellerCelebrationModal } = useHasSeenSellerCelebrationModal();

	const hasPaymentsBlock = useSelect( ( select ) => {
		const isSiteEditor = !! select( 'core/edit-site' );

		if ( isSiteEditor ) {
			const page = select( 'core/edit-site' ).getPage();
			const pageId = parseInt( page?.context?.postId );
			const pageEntity = select( 'core' ).getEntityRecord( 'postType', 'page', pageId );

			let paymentsBlock = false;
			// Only check for payment blocks if we haven't seen the celebration modal text yet
			if ( ! hasSeenSellerCelebrationModal ) {
				const didCountRecurringPayments =
					select( 'core/block-editor' ).getGlobalBlockCount( 'jetpack/recurring-payments' ) > 0;
				const didCountSimplePayments =
					select( 'core/block-editor' ).getGlobalBlockCount( 'jetpack/simple-payments' ) > 0;
				paymentsBlock =
					( pageEntity?.content?.raw?.includes( '<!-- wp:jetpack/recurring-payments -->' ) ||
						pageEntity?.content?.raw?.includes( '<!-- wp:jetpack/simple-payments -->' ) ||
						didCountRecurringPayments ||
						didCountSimplePayments ) ??
					false;
			}

			return paymentsBlock;
		}

		let paymentBlockCount = 0;
		// Only check for payment blocks if we haven't seen the celebration modal yet
		if ( ! hasSeenSellerCelebrationModal ) {
			paymentBlockCount += select( 'core/block-editor' ).getGlobalBlockCount(
				'jetpack/recurring-payments'
			);
			paymentBlockCount +=
				select( 'core/block-editor' ).getGlobalBlockCount( 'jetpack/simple-payments' );
		}

		return paymentBlockCount > 0;
	} );

	useEffect( () => {
		if (
			intent === 'sell' &&
			hasPaymentsBlock &&
			hasSelectedPaymentsOnce &&
			! hasSeenSellerCelebrationModal
		) {
			setShouldShowSellerCelebrationModal( true );
		}
	}, [ intent, hasPaymentsBlock, hasSelectedPaymentsOnce, hasSeenSellerCelebrationModal ] );
	return shouldShowSellerCelebrationModal;
};
export default useShouldShowSellerCelebrationModal;
