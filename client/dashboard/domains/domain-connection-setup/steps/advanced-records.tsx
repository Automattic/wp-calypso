import { DomainConnectionSetupMode } from '@automattic/api-core';
import { isSubdomain } from '@automattic/domain-search';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalHeading as Heading,
	Card,
	CardBody,
	Button,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Notice from '../../../components/notice';
import RecordsList from '../components/records-list';
import { getMappingVerificationErrorMessage } from '../utils';
import type { StepComponentProps, DNSRecord } from '../types';

export function AdvancedRecords( {
	domainName,
	onVerifyConnection,
	verificationInProgress,
	verificationStatus,
	showErrors,
	domainSetupInfo,
}: StepComponentProps ) {
	const isSubdomainFlow = isSubdomain( domainName );

	// Generate the records based on the setup info
	const records: DNSRecord[] = domainSetupInfo?.default_ip_addresses.map( ( ipAddress ) => {
		return {
			type: 'A',
			name: isSubdomainFlow ? domainName : '@',
			value: ipAddress,
		};
	} );

	records.push( {
		type: 'CNAME',
		name: `www.${ domainName }`,
		value: domainName,
	} );

	const renderErrorNotice = () => {
		return (
			<Notice variant="error">
				{ getMappingVerificationErrorMessage(
					DomainConnectionSetupMode.SUGGESTED,
					verificationStatus
				) }
			</Notice>
		);
	};

	return (
		<VStack spacing={ 6 }>
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						{ showErrors && renderErrorNotice() }

						<Heading level={ 2 } size={ 20 } weight={ 500 }>
							{ isSubdomainFlow
								? __( 'Update A & CNAME records' )
								: __( 'Update root A records & CNAME record' ) }
						</Heading>

						<Text as="p">
							{ isSubdomainFlow
								? __(
										'Update the A and CNAME records for your subdomain to point to WordPress.com.'
								  )
								: __(
										"Update your domain's A records and CNAME record to point to WordPress.com."
								  ) }
						</Text>

						<RecordsList records={ records } />

						<Notice variant="warning">
							{ createInterpolateElement(
								__(
									'<strong>Important:</strong> Make sure to delete any existing A records or CNAME records that point to other services before adding these new records.'
								),
								{
									strong: <strong />,
								}
							) }
						</Notice>

						<Text as="p">
							{ __(
								'After making these changes, it may take up to 72 hours for the changes to take effect.'
							) }
						</Text>

						<HStack justify="flex-start">
							<Button
								variant="primary"
								onClick={ () => onVerifyConnection( false ) }
								isBusy={ verificationInProgress }
								disabled={ verificationInProgress }
							>
								{ verificationInProgress ? __( 'Verifying…' ) : __( 'Verify Connection' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</VStack>
	);
}
