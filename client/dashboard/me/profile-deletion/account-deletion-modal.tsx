import { userPurchasesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useState } from '@wordpress/element';
import AlternativesModal from './alternatives-modal';
import FinalConfirmationModal from './final-confirmation-modal';
import PurchasesModal from './purchases-modal';
import type { Purchase } from '@automattic/api-core';

interface AccountDeletionModalProps {
	onClose: () => void;
	onConfirm: () => void;
	username: string;
	isDeleting: boolean;
	siteCount?: number;
}

export default function AccountDeletionModal( {
	onClose,
	onConfirm,
	username,
	isDeleting,
	siteCount = 0,
}: AccountDeletionModalProps ) {
	const [ showAlternatives, setShowAlternatives ] = useState( true );

	type PurchaseLike = Pick< Purchase, 'expiry_status' | 'product_slug' > & {
		is_cancelable?: boolean;
		is_refundable?: boolean;
	};

	// Block account deletion when user has active purchases (parity with v1)
	const { data: purchases } = useQuery( userPurchasesQuery() );
	const hasCancelablePurchases = Array.isArray( purchases )
		? ( purchases as PurchaseLike[] ).some( ( p ) => {
				if ( p.expiry_status === 'expired' ) {
					return false;
				}
				if ( p.product_slug === 'premium_theme' && ! p.is_refundable ) {
					return false;
				}
				return Boolean( p.is_cancelable );
		  } )
		: false;

	if ( hasCancelablePurchases ) {
		return <PurchasesModal onClose={ onClose } />;
	}

	const handleContinue = () => {
		setShowAlternatives( false );
	};

	if ( showAlternatives ) {
		return (
			<AlternativesModal
				onClose={ onClose }
				onContinue={ handleContinue }
				siteCount={ siteCount }
			/>
		);
	}

	return (
		<FinalConfirmationModal
			onClose={ onClose }
			onConfirm={ onConfirm }
			username={ username }
			isDeleting={ isDeleting }
		/>
	);
}
