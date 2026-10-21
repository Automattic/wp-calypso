import { useState } from 'react';
import { hasCancelablePurchases, hasRenewableMonetizeSubscriptions } from '../../utils/purchase';
import AlternativesModal from './alternatives-modal';
import FinalConfirmationModal from './final-confirmation-modal';
import PurchasesModal from './purchases-modal';
import type { MonetizeSubscription, Purchase } from '@automattic/api-core';

interface AccountDeletionModalProps {
	onClose: () => void;
	onConfirm: () => void;
	username: string;
	isDeleting: boolean;
	siteCount: number;
	purchases: Purchase[];
	monetizeSubscriptions: MonetizeSubscription[];
}

export default function AccountDeletionModal( {
	onClose,
	onConfirm,
	username,
	isDeleting,
	siteCount,
	purchases,
	monetizeSubscriptions,
}: AccountDeletionModalProps ) {
	const [ showAlternatives, setShowAlternatives ] = useState( true );

	if (
		hasCancelablePurchases( purchases ) ||
		hasRenewableMonetizeSubscriptions( monetizeSubscriptions )
	) {
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
