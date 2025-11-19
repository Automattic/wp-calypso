import {
	type DomainContactDetails,
	type DomainContactValidationResponse,
} from '@automattic/api-core';
import { countryListQuery, statesListQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	ExternalLink,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { debounce } from '@wordpress/compose';
import { DataForm, Field, useFormValidity, FormField } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import { ButtonStack } from '../button-stack';
import { Card, CardBody } from '../card';
import InlineSupportLink from '../inline-support-link';
import Notice from '../notice';
import { getContactFormFields } from './contact-form-fields';
import { RegionAddressFieldsLayout } from './region-address-fieldsets';

interface ContactFormProps {
	initialData?: DomainContactDetails;
	beforeForm?: React.ReactNode;
	isSubmitting: boolean;
	onSubmit: ( normalizedFormData: DomainContactDetails ) => void;
}

export default function ContactForm( {
	initialData,
	isSubmitting,
	beforeForm,
	onSubmit,
}: ContactFormProps ) {
	const { data: countryList } = useQuery( countryListQuery() );
	const [ formData, setFormData ] = useState< DomainContactDetails >(
		initialData ?? { optOutTransferLock: false }
	);
	const selectedCountryCode = formData.countryCode ?? initialData?.countryCode ?? '';
	const { data: statesList } = useQuery( statesListQuery( selectedCountryCode ) );

	const normalizedFormData = useMemo( () => {
		if ( ! statesList || statesList.length === 0 ) {
			return formData;
		}

		// If current state is not in the statesList, use the first available state
		const isValidState = statesList.some( ( state ) => state.code === formData.state );
		if ( formData.state && ! isValidState ) {
			return { ...formData, state: statesList[ 0 ]?.code };
		}

		return formData;
	}, [ formData, statesList ] );

	const isDirty = ! ( JSON.stringify( normalizedFormData ) === JSON.stringify( initialData ) );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		onSubmit( normalizedFormData );
	};

	// Create debounced async validator for field-level validation (triggered on change)
	const validateAsync = validateMutation.mutateAsync;

	const asyncValidator = useMemo( () => {
		type ValidationCallbacks = {
			resolve: ( value: DomainContactValidationResponse ) => void;
			reject: ( reason: unknown ) => void;
		};

		const debouncedFn = ( item: DomainContactDetails, callbacks: ValidationCallbacks ) => {
			validateAsync( item ).then( callbacks.resolve ).catch( callbacks.reject );
		};

		const debounced = debounce( debouncedFn as ( ...args: unknown[] ) => unknown, 800 ) as (
			item: DomainContactDetails,
			callbacks: ValidationCallbacks
		) => void;

		let pendingReject: ValidationCallbacks[ 'reject' ] | undefined;

		return ( item: DomainContactDetails ) =>
			new Promise< DomainContactValidationResponse >( ( resolve, reject ) => {
				if ( pendingReject ) {
					pendingReject( new Error( 'Validation request aborted' ) );
				}

				const callbacks: ValidationCallbacks = {
					resolve: ( response ) => {
						if ( pendingReject === reject ) {
							pendingReject = undefined;
						}
						resolve( response );
					},
					reject: ( error ) => {
						if ( pendingReject === reject ) {
							pendingReject = undefined;
						}
						reject( error );
					},
				};

				pendingReject = callbacks.reject;
				debounced( item, callbacks );
			} );
	}, [ validateAsync ] );

	const fields: Field< DomainContactDetails >[] = useMemo(
		() =>
			getContactFormFields(
				countryList ?? [],
				statesList ?? [],
				selectedCountryCode,
				asyncValidator
			),
		[ countryList, statesList, selectedCountryCode, asyncValidator ]
	);

	const form = {
		layout: { type: 'regular' as const },
		fields: [
			{
				id: 'name-row',
				layout: {
					type: 'row' as const,
					alignment: 'start' as const,
				},
				children: [ 'firstName', 'lastName' ],
			} as FormField,
			'organization',
			'email',
			'phone',
			'countryCode',
			...RegionAddressFieldsLayout( {
				statesList,
				countryList,
				countryCode: selectedCountryCode,
			} ),
			'optOutTransferLock',
		],
	};

	const { validity, isValid: canSave } = useFormValidity( normalizedFormData, fields, form );

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
					</Text>
				</VStack>
			</Notice>

			{ beforeForm }

			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<DataForm< DomainContactDetails >
							data={ normalizedFormData }
							fields={ fields }
							form={ form }
							validity={ validity }
							onChange={ ( edits: Partial< DomainContactDetails > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
						<Notice>
							<VStack>
								<Text as="p">
									{ createInterpolateElement(
										__(
											'By clicking <strong>Save</strong>, you agree to the applicable <agreementlink>Domain Registration Agreement</agreementlink> and confirm that the Transferee has agreed in writing to be bound by the same agreement. You authorize the respective registrar to act as your <agentlink>Designated Agent</agentlink>.'
										),
										{
											strong: <strong />,
											agreementlink: (
												<ExternalLink href="https://wordpress.com/automattic-domain-name-registration-agreement/">
													{ __( 'Domain Registration Agreement' ) }
												</ExternalLink>
											),
											agentlink: <InlineSupportLink supportContext="domain-designated-agent" />,
										}
									) }
								</Text>
							</VStack>
						</Notice>
						<form onSubmit={ handleSubmit }>
							<ButtonStack justify="flex-start">
								<Button
									__next40pxDefaultSize
									variant="primary"
									type="submit"
									isBusy={ isSubmitting }
									disabled={ ! canSave || ! isDirty || isSubmitting }
								>
									{ __( 'Save' ) }
								</Button>
							</ButtonStack>
						</form>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
