import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { isSubdomain } from '../../../../lib/domains';
import Progress from '../components/progress';
import RecordsList from '../components/records-list';
import type { StepComponentProps, DNSRecord } from '../types';

export default function SuggestedRecords( {
	domain,
	progressStepList,
	pageSlug,
	onVerifyConnection,
	verificationInProgress,
	domainSetupInfo,
}: StepComponentProps ) {
	const { data } = domainSetupInfo || {};
	const isSubdomainFlow = isSubdomain( domain );

	// Generate the records based on the setup info
	const records: DNSRecord[] = isSubdomainFlow
		? [
				{
					type: 'NS',
					name: domain,
					value: data?.wpcom_name_servers?.[ 0 ] || 'ns1.wordpress.com',
				},
				{
					type: 'NS',
					name: domain,
					value: data?.wpcom_name_servers?.[ 1 ] || 'ns2.wordpress.com',
				},
				{
					type: 'NS',
					name: domain,
					value: data?.wpcom_name_servers?.[ 2 ] || 'ns3.wordpress.com',
				},
		  ]
		: [
				{
					type: 'NS',
					name: '@',
					value: data?.wpcom_name_servers?.[ 0 ] || 'ns1.wordpress.com',
				},
				{
					type: 'NS',
					name: '@',
					value: data?.wpcom_name_servers?.[ 1 ] || 'ns2.wordpress.com',
				},
				{
					type: 'NS',
					name: '@',
					value: data?.wpcom_name_servers?.[ 2 ] || 'ns3.wordpress.com',
				},
		  ];

	const handleVerify = () => {
		if ( onVerifyConnection ) {
			onVerifyConnection();
		}
	};

	const showProgress = Object.keys( progressStepList ).includes( pageSlug );

	return (
		<VStack spacing={ 6 }>
			{ showProgress && <Progress steps={ progressStepList } currentStep={ pageSlug } /> }

			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
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
								variant="primary"
								onClick={ handleVerify }
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
