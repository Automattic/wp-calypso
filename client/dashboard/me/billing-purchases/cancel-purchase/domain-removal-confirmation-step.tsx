import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { SectionHeader } from '../../../components/section-header';
import { Text } from '../../../components/text';
import type { Purchase } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

import './style.scss';

interface DomainRemovalConfirmationStepProps {
	purchase: Purchase;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
}

interface DomainRemovalFormData {
	domain: string;
}

export default function DomainRemovalConfirmationStep( {
	purchase,
	onConfirm,
	onCancel,
	isLoading = false,
}: DomainRemovalConfirmationStepProps ) {
	const domainName = purchase.meta || purchase.product_name;
	const [ formData, setFormData ] = useState< DomainRemovalFormData >( {
		domain: '',
	} );

	const fields: Field< DomainRemovalFormData >[] = [
		{
			id: 'domain',
			label: __( 'Type your domain name to proceed' ),
			type: 'text' as const,
			description: sprintf(
				/* translators: %s is the domain name */
				__( 'The domain name is: %s' ),
				domainName
			),
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'domain' ],
	};

	const isDomainConfirmed = formData.domain === domainName;

	return (
		<VStack spacing={ 4 }>
			<SectionHeader title={ __( 'Confirm your decision' ) } level={ 3 } />

			<Text>
				{ createInterpolateElement(
					/* translators: <domainName /> is the domain name */
					__(
						'<domainName /> will be deleted. Any services related to it will stop working. Are you sure you want to proceed?'
					),
					{
						domainName: <strong>{ domainName }</strong>,
					}
				) }
			</Text>
			<DataForm< DomainRemovalFormData >
				data={ formData }
				fields={ fields }
				form={ form }
				onChange={ ( edits: Partial< DomainRemovalFormData > ) => {
					setFormData( ( data ) => ( { ...data, ...edits } ) );
				} }
			/>
			<ButtonStack justify="flex-start">
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ onCancel }
					disabled={ isLoading }
				>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					isDestructive
					onClick={ onConfirm }
					disabled={ ! isDomainConfirmed || isLoading }
					isBusy={ isLoading }
				>
					{ __( 'Delete this domain' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
