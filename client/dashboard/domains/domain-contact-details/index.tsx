import { WhoisType } from '@automattic/api-core';
import { domainQuery, domainWhoisQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import { ContactDetailsLayout } from './layout';
import type { WhoisDataEntry } from '@automattic/api-core';

export default function DomainContactDetails() {
	const { domainName } = useParams( { strict: false } );

	// Load both domain and whois data using useSuspenseQuery for automatic loading state handling
	// Error states are handled by the router's error boundary
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: whoisData } = useSuspenseQuery( domainWhoisQuery( domainName ) );

	// Find the registrant contact information from the whois data
	const registrantContact = whoisData?.find(
		( entry: WhoisDataEntry ) => entry.type === WhoisType.REGISTRANT
	);

	// Note: WhoisType only includes REGISTRANT and PRIVACY_SERVICE
	// Administrative and technical contacts are not available in this API

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

						{ /* Contact form will be implemented in task 5 */ }
						{ registrantContact ? (
							<VStack spacing={ 3 }>
								<div>
									<h4>{ __( 'Registrant Contact' ) }</h4>
									<VStack spacing={ 1 }>
										<p>
											<strong>{ __( 'Name:' ) }</strong> { registrantContact.fname }{ ' ' }
											{ registrantContact.lname }
										</p>
										{ registrantContact.org && (
											<p>
												<strong>{ __( 'Organization:' ) }</strong> { registrantContact.org }
											</p>
										) }
										<p>
											<strong>{ __( 'Email:' ) }</strong>{ ' ' }
											{ registrantContact.email || __( 'Not provided' ) }
										</p>
										{ registrantContact.phone && (
											<p>
												<strong>{ __( 'Phone:' ) }</strong> { registrantContact.phone }
											</p>
										) }
										{ registrantContact.sa1 && (
											<p>
												<strong>{ __( 'Address:' ) }</strong> { registrantContact.sa1 }
												{ registrantContact.sa2 && `, ${ registrantContact.sa2 }` }
												{ registrantContact.city && `, ${ registrantContact.city }` }
												{ registrantContact.state && `, ${ registrantContact.state }` }
												{ registrantContact.pc && ` ${ registrantContact.pc }` }
												{ registrantContact.country_code &&
													`, ${ registrantContact.country_code }` }
											</p>
										) }
									</VStack>
								</div>
							</VStack>
						) : (
							<div>
								<p>{ __( 'No contact information available for this domain.' ) }</p>
								<p>
									{ __(
										'Contact information may not be available for this domain type or may be protected by privacy settings.'
									) }
								</p>
							</div>
						) }
					</VStack>
				</CardBody>
			</Card>
		</ContactDetailsLayout>
	);
}
