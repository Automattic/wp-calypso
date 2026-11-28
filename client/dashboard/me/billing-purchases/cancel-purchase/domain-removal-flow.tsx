import { removePurchaseMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useCallback } from 'react';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import DomainRemovalConfirmationStep from './domain-removal-confirmation-step';
import DomainRemovalWarningStep from './domain-removal-warning-step';
import { usePostRemovalNavigation } from './use-post-removal-navigation';
import type { Purchase } from '@automattic/api-core';

import './style.scss';

interface DomainRemovalFlowProps {
	purchase: Purchase;
	onCancel: () => void;
}

type RemovalStep = 'warning' | 'confirmation';

export default function DomainRemovalFlow( { purchase, onCancel }: DomainRemovalFlowProps ) {
	const [ currentStep, setCurrentStep ] = useState< RemovalStep >( 'warning' );
	const { navigateAfterRemoval, invalidateSiteAfterRemoval } = usePostRemovalNavigation( purchase );
	const { mutate: removePurchase, isPending: isRemovingPurchase } = useMutation(
		withSnackbar( removePurchaseMutation(), {
			error: sprintf(
				/* translators: %(domainName)s is the name of the domain. */
				__(
					'There was a problem removing %(domainName)s. Please try again later or contact support.'
				),
				{ domainName: purchase.meta || purchase.product_name }
			),
		} )
	);

	const handleContinue = useCallback( () => {
		setCurrentStep( 'confirmation' );
	}, [] );

	const handleConfirm = useCallback( () => {
		removePurchase( purchase.ID, {
			onSuccess: () => {
				const domainName = purchase.meta || purchase.product_name;
				invalidateSiteAfterRemoval();
				navigateAfterRemoval(
					sprintf(
						/* translators: %(domain)s is a domain name */
						__( 'The domain %(domain)s was removed from your account.' ),
						{
							domain: domainName,
						}
					)
				);
			},
		} );
	}, [ purchase, removePurchase, navigateAfterRemoval, invalidateSiteAfterRemoval ] );

	return (
		<div>
			{ currentStep === 'warning' && (
				<DomainRemovalWarningStep
					purchase={ purchase }
					onContinue={ handleContinue }
					onCancel={ onCancel }
					isLoading={ isRemovingPurchase }
				/>
			) }
			{ currentStep === 'confirmation' && (
				<DomainRemovalConfirmationStep
					purchase={ purchase }
					onConfirm={ handleConfirm }
					onCancel={ onCancel }
					isLoading={ isRemovingPurchase }
				/>
			) }
		</div>
	);
}
