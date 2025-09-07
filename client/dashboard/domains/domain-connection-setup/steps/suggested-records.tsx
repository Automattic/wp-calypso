import { DomainConnectionSetupMode } from '@automattic/api-core';
import { isSubdomain } from '@automattic/domain-search';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import Notice from '../../../components/notice';
import RecordsList from '../components/records-list';
import { getMappingVerificationErrorMessage } from '../utils';
import type { StepComponentProps, DNSRecord } from '../types';

export function SuggestedRecords( {
	domainName,
	onVerifyConnection,
	verificationInProgress,
	verificationStatus,
	domainSetupInfo,
	showErrors,
}: StepComponentProps ) {
	const isSubdomainFlow = isSubdomain( domainName );

	// Generate the records based on the setup info
	const records: DNSRecord[] = isSubdomainFlow
		? [
				{
					type: 'NS',
					name: domainName,
					value: domainSetupInfo?.wpcom_name_servers?.[ 0 ] || 'ns1.wordpress.com',
				},
				{
					type: 'NS',
					name: domainName,
					value: domainSetupInfo?.wpcom_name_servers?.[ 1 ] || 'ns2.wordpress.com',
				},
				{
					type: 'NS',
					name: domainName,
					value: domainSetupInfo?.wpcom_name_servers?.[ 2 ] || 'ns3.wordpress.com',
				},
		  ]
		: [
				{
					type: 'NS',
					name: '@',
					value: domainSetupInfo?.wpcom_name_servers?.[ 0 ] || 'ns1.wordpress.com',
				},
				{
					type: 'NS',
					name: '@',
					value: domainSetupInfo?.wpcom_name_servers?.[ 1 ] || 'ns2.wordpress.com',
				},
				{
					type: 'NS',
					name: '@',
					value: domainSetupInfo?.wpcom_name_servers?.[ 2 ] || 'ns3.wordpress.com',
				},
		  ];

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
						<p>
							{ isSubdomainFlow
								? __(
										'Update the NS records for your subdomain to point to WordPress.com name servers.'
								  )
								: __(
										'Find the name servers on your domain’s settings page. Replace all the name servers of your domain to use the following values:'
								  ) }
						</p>

						<RecordsList records={ records } justValues={ ! isSubdomainFlow } />

						<p>
							{ __( 'Once you’ve updated the name servers click on "Verify Connection" below.' ) }
						</p>

						<HStack justify="flex-start">
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ onVerifyConnection }
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
