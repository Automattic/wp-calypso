import { useState } from 'react';
import { isRemoved } from '../../utils/purchase';
import AlternativesModal from './alternatives-modal';
import FinalConfirmationModal from './final-confirmation-modal';
import PurchasesModal from './purchases-modal';
import type { Purchase } from '@automattic/api-core';

interface AccountDeletionModalProps {
	onClose: () => void;
	onConfirm: () => void;
	username: string;
	isDeleting: boolean;
	siteCount: number;
	purchases: Purchase[];
}

export default function AccountDeletionModal( {
	onClose,
	onConfirm,
	username,
	isDeleting,
	siteCount,
	purchases,
}: AccountDeletionModalProps ) {
	const [ showAlternatives, setShowAlternatives ] = useState( true );

	const hasCancelablePurchases = purchases.some( ( p ) => {
		// Skip only fully-removed purchases. An expired-but-still-active purchase
		// (in its grace period) can still be renewed, so it should require action
		// before the account is deleted.
		if ( isRemoved( p ) ) {
			return false;
		}
		if ( p.product_slug === 'premium_theme' && ! p.is_refundable ) {
			return false;
		}
		return Boolean( p.is_cancelable );
	} );

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
