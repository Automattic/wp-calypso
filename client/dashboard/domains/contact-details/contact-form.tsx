import { useQuery } from '@tanstack/react-query';
import {
	ExternalLink,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Card,
	CardBody,
	CheckboxControl,
	SelectControl,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { DataForm, Field, isItemValid } from '@wordpress/dataviews';
import { createInterpolateElement, useCallback } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { isEqual } from 'lodash';
import { useEffect, useState } from 'react';
import { countryListQuery, statesListQuery } from '../../app/queries/domain';
import InlineSupportLink from '../../components/inline-support-link';
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

export default function ContactForm( {
	initialData,
	onSubmit,
	onCancel,
	isSubmitting = false,
}: ContactFormProps ) {
	const { data: countryList } = useQuery( countryListQuery() );
	const [ selectedCountryCode, setSelectedCountryCode ] = useState(
		initialData?.countryCode ?? ''
	);
	const { data: statesList } = useQuery( statesListQuery( selectedCountryCode ) );

	const [ formData, setFormData ] = useState< DomainContactDetails >(
		initialData ?? { optOutTransferLock: false }
	);

	const formattedCountryList = countryList?.map( ( country ) => ( {
		label: country.name,
		value: country.code,
	} ) );

	const isDirty = ! isEqual( formData, initialData );

	const handleSubmit = ( data: DomainContactDetails ) => {
		onSubmit?.( data );
	};

	useEffect( () => {
		if ( formData.countryCode ) {
			setSelectedCountryCode( formData.countryCode as string );
		}
	}, [ formData.countryCode, setSelectedCountryCode ] );

	// Memoize the custom Edit component for the state field to prevent focus loss
	const StateFieldEdit = useCallback(
		( { field, onChange, data, hideLabelFromVision }: any ) => {
			const { id, getValue } = field;

			if ( ! statesList || statesList?.length === 0 ) {
				return (
					<InputControl
						__next40pxDefaultSize
						label={ hideLabelFromVision ? '' : __( 'State' ) }
						placeholder={ __( 'State' ) }
						value={ getValue( { item: data } ) }
						onChange={ ( value ) => onChange( { [ id ]: value } ) }
					/>
				);
			}

			// If the item data is not in the statesList, set the state to the first option
			if ( ! statesList?.some( ( state ) => state.code === getValue( { item: data } ) ) ) {
				onChange( { [ id ]: statesList[ 0 ]?.code } );
			}

			return (
				<SelectControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					label={ hideLabelFromVision ? '' : __( 'State' ) }
					value={ getValue( { item: data } ) }
					options={
						statesList.map( ( state ) => ( {
							label: state.name,
							value: state.code,
						} ) ) ?? []
					}
					onChange={ ( value ) => onChange( { [ id ]: value } ) }
				/>
			);
		},
		[ statesList ]
	);

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
			getValue: ( { item }: { item: DomainContactDetails } ) => item.state ?? '',
			Edit: StateFieldEdit,
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
