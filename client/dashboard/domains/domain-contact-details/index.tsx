import { WhoisType } from '@automattic/api-core';
import { domainWhoisQuery } from '@automattic/api-queries';
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

	// Use useSuspenseQuery for automatic loading state handling
	// Error states are handled by the router's error boundary
	const { data: whoisData } = useSuspenseQuery( domainWhoisQuery( domainName ) );

	// Find the registrant contact information from the whois data
	const registrantContact = whoisData?.find(
		( entry: WhoisDataEntry ) => entry.type === WhoisType.REGISTRANT
	);

	return (
		<ContactDetailsLayout>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader title={ __( 'Contact details & privacy' ) } level={ 3 } />
						{ /* Contact form will be implemented in task 5 */ }
						<div>{ __( 'Contact information will be displayed here' ) }</div>
						{ /* Display basic contact info for verification */ }
						{ registrantContact && (
							<div>
								<p>
									{ __( 'Domain:' ) } { domainName }
								</p>
								<p>
									{ __( 'Email:' ) } { registrantContact.email || __( 'Not provided' ) }
								</p>
								<p>
									{ __( 'Name:' ) } { registrantContact.fname } { registrantContact.lname }
								</p>
								<p>
									{ __( 'Organization:' ) } { registrantContact.org || __( 'Not provided' ) }
								</p>
								<p>
									{ __( 'Country:' ) } { registrantContact.country_code || __( 'Not provided' ) }
								</p>
								<p>
									{ __( 'Phone:' ) } { registrantContact.phone || __( 'Not provided' ) }
								</p>
							</div>
						) }
						{ ! registrantContact && (
							<div>
								<p>{ __( 'No contact information available for this domain.' ) }</p>
							</div>
						) }
					</VStack>
				</CardBody>
			</Card>
		</ContactDetailsLayout>
	);
}
