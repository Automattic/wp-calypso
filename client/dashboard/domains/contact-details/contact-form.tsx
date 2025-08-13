import {
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Card,
	CardBody,
	CheckboxControl,
} from '@wordpress/components';
import { DataForm, Field, isItemValid } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { isEqual } from 'lodash';
import { useState } from 'react';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import type { DomainContactDetails } from './types';
import type { CountryListItem } from '../../data/domain';

import './contact-form.scss';
interface ContactFormProps {
	initialData?: DomainContactDetails;
	onSubmit?: ( data: DomainContactDetails ) => void;
	onCancel?: () => void;
	errors?: Partial< Record< keyof DomainContactDetails, string > >;
	isSubmitting?: boolean;
	countryList: CountryListItem[];
}

export default function ContactForm( {
	initialData,
	onSubmit,
	onCancel,
	isSubmitting = false,
	countryList,
}: ContactFormProps ) {
	const [ formData, setFormData ] = useState< DomainContactDetails >(
		initialData ?? { optOutTransferLock: false }
	);

	const formattedCountryList = countryList.map( ( country ) => ( {
		label: country.name,
		value: country.code,
	} ) );

	const isDirty = ! isEqual( formData, initialData );

	const handleSubmit = ( data: DomainContactDetails ) => {
		onSubmit?.( data );
	};

	const fields: Field< DomainContactDetails >[] = [
		{
			id: 'firstName',
			label: __( 'First Name' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'lastName',
			label: __( 'Last Name' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'organization',
			label: __( 'Organization' ),
			type: 'text',
		},
		{
			id: 'email',
			label: __( 'Email' ),
			type: 'email',
			isValid: {
				required: true,
			},
		},
		{
			id: 'phone',
			label: __( 'Phone' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'countryCode',
			label: __( 'Country' ),
			type: 'select',
			elements: formattedCountryList,
			isValid: {
				required: true,
			},
		},
		{
			id: 'address1',
			label: __( 'Address' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'address2',
			label: __( 'Address Line 2' ),
			type: 'text',
		},
		{
			id: 'city',
			label: __( 'City' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'state',
			label: __( 'State' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'postalCode',
			label: __( 'Post Code' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'optOutTransferLock',
			label: __( 'Opt-out of the 60-day transfer lock' ),
			type: 'boolean',
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { id, getValue } = field;
				return (
					<CheckboxControl
						label={
							hideLabelFromVision
								? ''
								: createInterpolateElement(
										sprintf(
											/* translators: %s: "what is this?" link */
											__( 'Opt-out of the 60-day transfer lock <link>%s</link>' ),
											__( 'what is this?' )
										),
										{
											link: <InlineSupportLink supportContext="60-day-transfer-lock" />,
										}
								  )
						}
						checked={ getValue( { item: data } ) }
						onChange={ () => onChange( { [ id ]: ! getValue( { item: data } ) } ) }
					/>
				);
			},
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
			'state',
			'postalCode',
			'optOutTransferLock',
		],
	};

	const canSave = isItemValid( formData, fields, form );

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
						<ExternalLink
							// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
							href="https://wordpress.com/support/domains/private-domain-registration/#what-is-privacy-protection"
						>
							{ __( 'Learn more' ) }
						</ExternalLink>
						.
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
						<Notice>
							<VStack>
								<Text as="p">
									{ createInterpolateElement(
										__(
											'By clicking <strong>Save contact info</strong>, you agree to the applicable <agreementlink>Domain Registration Agreement</agreementlink> and confirm that the Transferee has agreed in writing to be bound by the same agreement. You authorize the respective registrar to act as your <agentlink>Designated Agent</agentlink>.'
										),
										{
											strong: <strong />,
											agreementlink: (
												<a
													// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
													href="https://wordpress.com/automattic-domain-name-registration-agreement/"
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
											agentlink: (
												<a
													// eslint-disable-next-line wpcalypso/i18n-unlocalized-url
													href="https://wordpress.com/support/domains/update-contact-information/#designated-agent"
													target="_blank"
													rel="noopener noreferrer"
												/>
											),
										}
									) }
								</Text>
							</VStack>
						</Notice>
						<HStack justify="flex-start" spacing={ 2 }>
							<Button
								onClick={ () => handleSubmit( formData ) }
								variant="primary"
								type="submit"
								isBusy={ isSubmitting }
								disabled={ ! canSave || ! isDirty || isSubmitting }
							>
								{ __( 'Save contact info' ) }
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
