import {
	Button,
	__experimentalInputControl as InputControl,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useCallback } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { Text } from '../../../components/text';
import type { Purchase } from '@automattic/api-core';

import './style.scss';

interface DomainRemovalConfirmationStepProps {
	purchase: Purchase;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
}

export default function DomainRemovalConfirmationStep( {
	purchase,
	onConfirm,
	onCancel,
	isLoading = false,
}: DomainRemovalConfirmationStepProps ) {
	const domainName = purchase.meta || purchase.product_name;
	const [ inputValue, setInputValue ] = useState( '' );
	const [ domainConfirmed, setDomainConfirmed ] = useState( false );

	const handleInputChange = useCallback(
		( value: string | undefined ) => {
			const newValue = value || '';
			setInputValue( newValue );
			setDomainConfirmed( newValue === domainName );
		},
		[ domainName ]
	);

	return (
		<VStack spacing={ 8 }>
			<VStack spacing={ 3 }>
				<Heading level={ 2 }>{ __( 'Confirm your decision' ) }</Heading>

				<Text as="p">
					{ createInterpolateElement(
						sprintf(
							/* translators: %s is the domain name */
							__(
								'<strong>%s</strong> will be deleted. Any services related to it will stop working. Are you sure you want to proceed?'
							),
							domainName
						),
						{
							strong: <strong />,
						}
					) }
				</Text>

				<InputControl
					__next40pxDefaultSize
					label={ __( 'Type your domain name to proceed' ) }
					value={ inputValue }
					onChange={ handleInputChange }
					disabled={ isLoading }
					placeholder={ domainName }
				/>
			</VStack>

			<ButtonStack>
				<Button
					__next40pxDefaultSize
					variant="primary"
					isDestructive
					onClick={ onConfirm }
					disabled={ ! domainConfirmed || isLoading }
				>
					{ __( 'Delete this domain' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ onCancel }
					disabled={ isLoading }
				>
					{ __( 'Cancel' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
