import { DomainConnectionSetupMode } from '@automattic/api-core';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
	__experimentalText as Text,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody } from '../../../components/card';
import Notice from '../../../components/notice';
import { isSubdomain } from '../../../utils/domain';
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

	const records: DNSRecord[] = domainSetupInfo?.wpcom_name_servers.map( ( nameServer ) => {
		return {
			type: 'NS',
			name: isSubdomainFlow ? domainName : '@',
			value: nameServer,
		};
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
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					{ showErrors && renderErrorNotice() }
					<Text as="p">
						{ isSubdomainFlow
							? __(
									'Update the NS records for your subdomain to point to WordPress.com name servers.'
							  )
							: __(
									'Find the name servers on your domain’s settings page. Replace all the name servers of your domain to use the following values:'
							  ) }
					</Text>

					<RecordsList records={ records } justValues />

					<Text as="p">
						{ __( 'Once you’ve updated the name servers click on "Verify Connection" below.' ) }
					</Text>

					<HStack justify="flex-start">
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ () => onVerifyConnection( true ) }
							isBusy={ verificationInProgress }
							disabled={ verificationInProgress }
						>
							{ verificationInProgress ? __( 'Verifying…' ) : __( 'Verify Connection' ) }
						</Button>
					</HStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
