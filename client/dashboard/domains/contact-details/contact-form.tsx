import {
	ExternalLink,
	Flex,
	Notice,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { DataForm, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import type { DomainContactDetails } from './types';

import './contact-form.scss';
interface ContactFormProps {
	initialData?: Partial< DomainContactDetails >;
	onSubmit?: ( data: DomainContactDetails ) => void;
	onCancel?: () => void;
	errors?: Partial< Record< keyof DomainContactDetails, string > >;
	isSubmitting?: boolean;
}

// Mock data - in a real implementation, this would come from an API
const COUNTRIES = [
	{ label: 'United Kingdom', value: 'GB' },
	{ label: 'United States', value: 'US' },
	{ label: 'Canada', value: 'CA' },
	{ label: 'Brazil', value: 'BR' },
	{ label: 'Germany', value: 'DE' },
	{ label: 'France', value: 'FR' },
	{ label: 'Spain', value: 'ES' },
	{ label: 'Italy', value: 'IT' },
	{ label: 'Netherlands', value: 'NL' },
	{ label: 'Australia', value: 'AU' },
];

export default function ContactForm( {
	initialData = {},
	onSubmit,
	onCancel,
	errors = {},
	isSubmitting = false,
}: ContactFormProps ) {
	const [ formData, setFormData ] = useState< DomainContactDetails >( {
		...initialData,
	} );

	console.log( 'formData', formData );

	const handleFieldChange = ( field: keyof DomainContactDetails, value: string | boolean ) => {
		setFormData( ( prev ) => ( {
			...prev,
			[ field ]: value,
		} ) );
	};

	const handleSubmit = ( data: DomainContactDetails ) => {
		onSubmit?.( data );
	};

	const fields: Field< DomainContactDetails >[] = [
		{
			id: 'firstName',
			label: 'First Name',
			type: 'text',
		},
		{
			id: 'lastName',
			label: 'Last Name',
			type: 'text',
		},
		{
			id: 'organization',
			label: 'Organization',
			type: 'text',
		},
		{
			id: 'email',
			label: 'Email',
			type: 'email',
		},
		{
			id: 'phone',
			label: 'Phone',
			type: 'text',
		},
		{
			id: 'countryCode',
			label: 'Country',
			type: 'select',
			elements: COUNTRIES,
		},
		{
			id: 'address1',
			label: 'Address Line 1',
			type: 'text',
		},
		{
			id: 'address2',
			label: 'Address Line 2',
			type: 'text',
		},
		{
			id: 'city',
			label: 'City',
			type: 'text',
		},
		{
			id: 'postalCode',
			label: 'Post Code',
			type: 'text',
		},
		{
			id: 'optOutTransferLock',
			label: 'Opt Out Transfer Lock',
			type: 'checkbox',
		},
	];

	const form = {
		type: 'regular' as const,
		labelPosition: 'top' as const,
		fields: [
			'firstName',
			'lastName',
			'organization',
			'email',
			'phone',
			'countryCode',
			'address1',
			'address2',
			'city',
			'postalCode',
			'optOutTransferLock',
		],
	};

	return (
		<div className="contact-form">
			<VStack spacing={ 4 }>
				<DataForm< DomainContactDetails >
					data={ formData }
					fields={ fields }
					form={ form }
					onChange={ ( edits: Partial< DomainContactDetails > ) => {
						setFormData( ( data ) => ( { ...data, ...edits } ) );
					} }
				/>
				<HStack justify="flex-start">
					<Button variant="primary" type="submit" isBusy={ isSubmitting } disabled={ isSubmitting }>
						{ __( 'Save' ) }
					</Button>
				</HStack>
			</VStack>

			{ /* Legal Disclaimer */ }
			<Notice status="info" isDismissible={ false } className="contact-form__legal-notice">
				<p>
					{ __( 'By clicking **Save contact info**, you agree to the applicable' ) }{ ' ' }
					<ExternalLink href="#">{ __( 'Domain Registration Agreement' ) }</ExternalLink>{ ' ' }
					{ __(
						'and confirm that the Transferee has agreed in writing to be bound by the same agreement. You authorize the respective registrar to act as your'
					) }{ ' ' }
					<ExternalLink href="#">{ __( 'Designated Agent' ) }</ExternalLink>.
				</p>
			</Notice>

			{ /* Cancel Button */ }
			{ onCancel && (
				<div className="contact-form__actions">
					<Flex gap={ 3 } justify="start">
						<button
							type="button"
							className="contact-form__cancel-button"
							onClick={ onCancel }
							disabled={ isSubmitting }
						>
							{ __( 'Cancel' ) }
						</button>
					</Flex>
				</div>
			) }
		</div>
	);
}
