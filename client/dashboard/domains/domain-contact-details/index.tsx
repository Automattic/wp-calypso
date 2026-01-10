import { WhoisType, type DomainContactDetails, WhoisDataEntry } from '@automattic/api-core';
import { domainQuery, domainWhoisQuery, domainWhoisMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import ContactForm from './contact-form';
import { ContactDetailsLayout } from './layout';

export default function DomainContactDetails() {
	const { domainName } = useParams( { strict: false } );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	// Load both domain and whois data using useSuspenseQuery for automatic loading state handling
	// Error states are handled by the router's error boundary
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: whoisData } = useSuspenseQuery( domainWhoisQuery( domainName ) );

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
		saveContactInfo(
			{ domainContactDetails: contactData, transferLock },
			{
				onSuccess: () => {
					createSuccessNotice( __( 'Contact information updated successfully.' ), {
						type: 'snackbar',
					} );
				},
				onError: ( error ) => {
					createErrorNotice(
						error.message || __( 'Failed to update contact information. Please try again.' ),
						{
							type: 'snackbar',
						}
					);
				},
			}
		);
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
								isSubmitting={ isSaving }
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
									isSubmitting={ isSaving }
								/>
							</VStack>
						) }
					</VStack>
				</CardBody>
			</Card>
		</ContactDetailsLayout>
	);
}
