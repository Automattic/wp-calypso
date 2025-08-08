import {
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { DataForm, Field } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import Notice from '../../components/notice';
import type { DomainContactDetails } from './types';

import './contact-form.scss';
interface ContactFormProps {
	initialData?: DomainContactDetails;
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
	initialData,
	onSubmit,
	onCancel,
	errors = {},
	isSubmitting = false,
}: ContactFormProps ) {
	const [ formData, setFormData ] = useState< DomainContactDetails >(
		initialData ?? ( {} as DomainContactDetails )
	);

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
		<VStack spacing={ 10 }>
			<Notice>
				<VStack>
					<Text as="p">{ __( 'Provide accurate contact information' ) }</Text>
					<Text as="p">
						{ createInterpolateElement(
							sprintf(
								/* translators: %1$s: ICANN acronym */
								__(
									'<external>%s</external> requires accurate contact information for registrants. This information will be validated after purchase. Failure to validate your contact information will result in domain suspension.'
								),
								'ICANN'
							),
							{
								external: (
									<Button
										variant="link"
										target="_blank"
										href="https://www.icann.org/resources/pages/contact-verification-2013-05-03-en"
									>
										ICANN
									</Button>
								),
							}
						) }
					</Text>
					<Text as="p">
						{ __( 'Domain privacy service is included for free on applicable domains.' ) }{ ' ' }
						<ExternalLink href="#">{ __( 'Learn more' ) }</ExternalLink>.
					</Text>
				</VStack>
			</Notice>

			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<DataForm< DomainContactDetails >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< DomainContactDetails > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
						<HStack justify="flex-start" spacing={ 2 }>
							<Button
								onClick={ () => handleSubmit( formData ) }
								variant="primary"
								type="submit"
								isBusy={ isSubmitting }
								disabled={ isSubmitting }
							>
								{ __( 'Save' ) }
							</Button>
							<Button variant="secondary" onClick={ onCancel }>
								{ __( 'Cancel' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
