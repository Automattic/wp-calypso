import { type DomainContactDetails } from '@automattic/api-core';
import {
	countryListQuery,
	statesListQuery,
	domainWhoisMutation,
	domainWhoisValidateMutation,
	domainQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	ExternalLink,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field, isItemValid, FormField } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { getContactFormFields } from './contact-form-fields';
import ContactFormPrivacy from './contact-form-privacy';

interface ContactFormProps {
	domainName: string;
	initialData?: DomainContactDetails;
}

export default function ContactForm( { domainName, initialData }: ContactFormProps ) {
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: countryList } = useQuery( countryListQuery() );
	const [ formData, setFormData ] = useState< DomainContactDetails >(
		initialData ?? { optOutTransferLock: false }
	);
	const selectedCountryCode = formData.countryCode ?? initialData?.countryCode ?? '';
	const { data: statesList } = useQuery( statesListQuery( selectedCountryCode ) );
	const validateMutation = useMutation( domainWhoisValidateMutation( domainName ) );
	const updateMutation = useMutation( domainWhoisMutation( domainName ) );
	const isMobileViewport = useViewportMatch( 'small', '<' );

	const isDirty = ! ( JSON.stringify( formData ) === JSON.stringify( initialData ) );
	const isSubmitting = validateMutation.isPending || updateMutation.isPending;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		validateMutation.mutate( formData, {
			onSuccess: ( data ) => {
				if ( data.success ) {
					updateMutation.mutate(
						{
							domainContactDetails: formData,
							transferLock: formData.optOutTransferLock === false,
						},
						{
							onSuccess: () => {
								createSuccessNotice( __( 'Contact details saved.' ), { type: 'snackbar' } );
							},
							onError: ( error: Error ) => {
								createErrorNotice( error.message, {
									type: 'snackbar',
								} );
							},
						}
					);
				} else {
					createErrorNotice( data.messages_simple.join( ' ' ), {
						type: 'snackbar',
					} );
				}
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message, {
					type: 'snackbar',
				} );
			},
		} );
	};

	const fields: Field< DomainContactDetails >[] = useMemo(
		() => getContactFormFields( countryList ?? [], statesList ?? [] ),
		[ countryList, statesList ]
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
			{
				id: 'contact-row',
				layout: {
					type: 'row' as const,
					alignment: 'start' as const,
				},
				children: [ 'email', 'phone' ],
			} as FormField,
			'countryCode',
			'address1',
			'address2',
			{
				id: 'location-row',
				layout: {
					type: 'row' as const,
					alignment: 'start' as const,
				},
				children: isMobileViewport ? [ 'city', 'state' ] : [ 'city', 'state', 'postalCode' ],
			} as FormField,
			...( isMobileViewport ? [ 'postalCode' ] : [] ),
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

			{ ! domain.is_hundred_year_domain && (
				<Card>
					<CardBody>
						<ContactFormPrivacy domainName={ domainName } />
					</CardBody>
				</Card>
			) }

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
									variant="primary"
									type="submit"
									isBusy={ isSubmitting }
									disabled={ ! canSave || ! isDirty || isSubmitting }
								>
									{ __( 'Save contact info' ) }
								</Button>
							</ButtonStack>
						</form>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
