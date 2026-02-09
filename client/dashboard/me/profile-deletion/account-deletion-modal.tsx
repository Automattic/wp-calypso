import { useState } from 'react';
import AlternativesModal from './alternatives-modal';
import FinalConfirmationModal from './final-confirmation-modal';
import PurchasesModal from './purchases-modal';
import type { Purchase } from '@automattic/api-core';

type PurchaseLike = Pick<
	Purchase,
	'expiry_status' | 'product_slug' | 'is_cancelable' | 'is_refundable'
>;

interface AccountDeletionModalProps {
	onClose: () => void;
	onConfirm: () => void;
	username: string;
	isDeleting: boolean;
	siteCount: number;
	purchases: PurchaseLike[];
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
		if ( p.expiry_status === 'expired' ) {
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
