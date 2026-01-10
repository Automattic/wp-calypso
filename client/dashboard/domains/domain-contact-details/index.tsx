import { WhoisType, type DomainContactDetails, WhoisDataEntry } from '@automattic/api-core';
import {
	domainQuery,
	domainWhoisQuery,
	domainWhoisMutation,
	domainWhoisValidateMutation,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import ContactForm from './contact-form';
import { ContactDetailsLayout } from './layout';

export default function DomainContactDetails() {
	const { domainName } = useParams( { strict: false } );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ validationErrors, setValidationErrors ] = useState< Record< string, string > >( {} );

	// Load both domain and whois data using useSuspenseQuery for automatic loading state handling
	// Error states are handled by the router's error boundary
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: whoisData } = useSuspenseQuery( domainWhoisQuery( domainName ) );

	// Set up the mutation for validating contact information
	const { mutate: validateContactInfo, isPending: isValidating } = useMutation(
		domainWhoisValidateMutation( [ domainName ] )
	);

	// Set up the mutation for saving contact information
	const { mutate: saveContactInfo, isPending: isSaving } = useMutation(
		domainWhoisMutation( domainName )
	);

	// Find the registrant contact information from the whois data
	const registrantContact = whoisData?.find(
		( entry: WhoisDataEntry ) => entry.type === WhoisType.REGISTRANT
	);

	// Transform whois data to DomainContactDetails format
	const transformWhoisToContactDetails = ( whoisEntry: WhoisDataEntry ): DomainContactDetails => {
		return {
			firstName: whoisEntry.fname || '',
			lastName: whoisEntry.lname || '',
			organization: whoisEntry.org || '',
			email: whoisEntry.email || '',
			phone: whoisEntry.phone || '',
			address1: whoisEntry.sa1 || '',
			address2: whoisEntry.sa2 || '',
			city: whoisEntry.city || '',
			state: whoisEntry.state || '',
			postalCode: whoisEntry.pc || '',
			countryCode: whoisEntry.country_code || '',
			fax: whoisEntry.fax || '',
			vatId: '', // WhoisDataEntry doesn't have vat_id field
			optOutTransferLock: false, // Default to keeping transfer lock enabled
		};
	};

	// Get initial contact data for the form
	const initialContactData = registrantContact
		? transformWhoisToContactDetails( registrantContact )
		: {
				firstName: '',
				lastName: '',
				organization: '',
				email: '',
				phone: '',
				address1: '',
				address2: '',
				city: '',
				state: '',
				postalCode: '',
				countryCode: '',
				fax: '',
				vatId: '',
				optOutTransferLock: false, // Default to keeping transfer lock enabled
		  };

	const handleSave = ( contactData: DomainContactDetails, transferLock: boolean ) => {
		// Clear any previous validation errors
		setValidationErrors( {} );

		// Transform contact data to ensure proper format for API
		const transformedContactData: DomainContactDetails = {
			firstName: contactData.firstName?.trim() || '',
			lastName: contactData.lastName?.trim() || '',
			organization: contactData.organization?.trim() || '',
			email: contactData.email?.trim() || '',
			phone: contactData.phone?.trim() || '',
			address1: contactData.address1?.trim() || '',
			address2: contactData.address2?.trim() || '',
			city: contactData.city?.trim() || '',
			state: contactData.state?.trim() || '',
			postalCode: contactData.postalCode?.trim() || '',
			countryCode: contactData.countryCode || '',
			fax: contactData.fax?.trim() || '',
			vatId: contactData.vatId?.trim() || '',
			optOutTransferLock: contactData.optOutTransferLock || false,
		};

		// First validate the contact information on the server
		validateContactInfo( transformedContactData, {
			onSuccess: ( validationResult ) => {
				// Check if validation failed
				if ( ! validationResult.success ) {
					// Extract field-specific validation errors from the messages
					const fieldErrors: Record< string, string > = {};

					if ( validationResult.messages ) {
						// Map snake_case API field names to camelCase form field names
						const fieldMapping: Record< string, string > = {
							first_name: 'firstName',
							last_name: 'lastName',
							organization: 'organization',
							email: 'email',
							phone: 'phone',
							address_1: 'address1',
							address_2: 'address2',
							city: 'city',
							state: 'state',
							postal_code: 'postalCode',
							country_code: 'countryCode',
							fax: 'fax',
							vat_id: 'vatId',
						};

						Object.entries( validationResult.messages ).forEach( ( [ apiField, messages ] ) => {
							if ( Array.isArray( messages ) && messages.length > 0 ) {
								const formField = fieldMapping[ apiField ] || apiField;
								fieldErrors[ formField ] = messages[ 0 ]; // Use first error message
							}
						} );
					}

					// Display field-specific validation errors
					setValidationErrors( fieldErrors );

					// Show a general error notice
					createErrorNotice( __( 'Please correct the highlighted fields and try again.' ), {
						type: 'snackbar',
						isDismissible: true,
					} );
					return;
				}

				// If validation passes, proceed with saving
				saveContactInfo(
					{ domainContactDetails: transformedContactData, transferLock },
					{
						onSuccess: () => {
							createSuccessNotice(
								__(
									'Contact information updated successfully. Changes may take a few minutes to appear in public records.'
								),
								{
									type: 'snackbar',
									isDismissible: true,
								}
							);
						},
						onError: ( error: any ) => {
							// Handle different types of errors
							let errorMessage = __( 'Failed to update contact information. Please try again.' );

							if ( error?.message ) {
								errorMessage = error.message;
							} else if ( error?.code === 'domain_contact_validation_failed' ) {
								errorMessage = __(
									'Contact information validation failed. Please check your details and try again.'
								);
							} else if ( error?.code === 'domain_locked' ) {
								errorMessage = __(
									'This domain is currently locked and cannot be updated. Please contact support.'
								);
							} else if ( error?.code === 'unauthorized' ) {
								errorMessage = __(
									"You do not have permission to update this domain's contact information."
								);
							}

							createErrorNotice( errorMessage, {
								type: 'snackbar',
								isDismissible: true,
							} );
						},
					}
				);
			},
			onError: ( error: any ) => {
				// Handle validation API errors
				let errorMessage = __( 'Failed to validate contact information. Please try again.' );

				if ( error?.message ) {
					errorMessage = error.message;
				}

				createErrorNotice( errorMessage, {
					type: 'snackbar',
					isDismissible: true,
				} );
			},
		} );
	};

	return (
		<ContactDetailsLayout>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader title={ __( 'Contact details & privacy' ) } level={ 3 } />

						{ /* Domain information header */ }
						<div>
							<p>
								<strong>{ __( 'Domain:' ) }</strong> { domainName }
							</p>
							{ domain.private_domain && (
								<p>
									<strong>{ __( 'Privacy Protection:' ) }</strong> { __( 'Enabled' ) }
								</p>
							) }
						</div>

						{ /* Contact form - always in edit mode */ }
						{ registrantContact ? (
							<ContactForm
								domain={ domain }
								initialData={ initialContactData }
								onSave={ handleSave }
								isSubmitting={ isSaving || isValidating }
								validationErrors={ validationErrors }
							/>
						) : (
							<VStack spacing={ 3 }>
								<div>
									<p>{ __( 'No contact information available for this domain.' ) }</p>
									<p>
										{ __(
											'Contact information may not be available for this domain type or may be protected by privacy settings.'
										) }
									</p>
								</div>
								{ /* Show form even if no contact info exists */ }
								<ContactForm
									domain={ domain }
									initialData={ initialContactData }
									onSave={ handleSave }
									isSubmitting={ isSaving || isValidating }
									validationErrors={ validationErrors }
								/>
							</VStack>
						) }
					</VStack>
				</CardBody>
			</Card>
		</ContactDetailsLayout>
	);
}
