import { removePurchaseMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useCallback } from 'react';
import { purchaseSettingsRoute } from '../../../app/router/me';
import DomainRemovalConfirmationStep from './domain-removal-confirmation-step';
import DomainRemovalWarningStep from './domain-removal-warning-step';
import type { Purchase } from '@automattic/api-core';

import './style.scss';

interface DomainRemovalFlowProps {
	purchase: Purchase;
	onCancel: () => void;
}

type RemovalStep = 'warning' | 'confirmation';

export default function DomainRemovalFlow( { purchase, onCancel }: DomainRemovalFlowProps ) {
	const [ currentStep, setCurrentStep ] = useState< RemovalStep >( 'warning' );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const navigate = useNavigate();
	const removePurchaseMutator = useMutation( removePurchaseMutation() );

	const handleContinue = useCallback( () => {
		setCurrentStep( 'confirmation' );
	}, [] );

	const handleConfirm = useCallback( () => {
		removePurchaseMutator.mutate( purchase.ID, {
			onSuccess: () => {
				const domainName = purchase.meta || purchase.product_name;
				createSuccessNotice(
					sprintf(
						/* translators: %(domain)s is a domain name */
						__( 'The domain %(domain)s was removed from your account.' ),
						{
							domain: domainName,
						}
					),
					{ type: 'snackbar' }
				);
				navigate( {
					to: purchaseSettingsRoute.fullPath,
					params: { purchaseId: purchase.ID },
				} );
			},
			onError: () => {
				const domainName = purchase.meta || purchase.product_name;
				createErrorNotice(
					sprintf(
						/* translators: %(domainName)s is the name of the domain. */
						__(
							'There was a problem removing %(domainName)s. Please try again later or contact support.'
						),
						{ domainName }
					),
					{ type: 'snackbar' }
				);
			},
		} );
	}, [ purchase, removePurchaseMutator, createSuccessNotice, createErrorNotice, navigate ] );

	const isLoading = removePurchaseMutator.isPending;

	return (
		<div>
			{ currentStep === 'warning' && (
				<DomainRemovalWarningStep
					purchase={ purchase }
					onContinue={ handleContinue }
					onCancel={ onCancel }
					isLoading={ isLoading }
				/>
			) }
			{ currentStep === 'confirmation' && (
				<DomainRemovalConfirmationStep
					purchase={ purchase }
					onConfirm={ handleConfirm }
					onCancel={ onCancel }
					isLoading={ isLoading }
				/>
			) }
		</div>
	);
}
