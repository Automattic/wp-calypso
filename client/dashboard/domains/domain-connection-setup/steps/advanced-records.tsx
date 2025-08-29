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

export default function AdvancedRecords( {
	domain,
	progressStepList,
	pageSlug,
	onVerifyConnection,
	verificationInProgress,
	domainSetupInfo,
}: StepComponentProps ) {
	const { data } = domainSetupInfo || {};
	const isSubdomainFlow = isSubdomain( domain );

	// TODO: those need to come from domainSetupInfo data - see the original code in client/components/domains/connect-domain-step/connect-domain-step-advanced-records.jsx

	// Generate the records based on the setup info
	const records: DNSRecord[] = isSubdomainFlow
		? [
				{
					type: 'A',
					name: domain,
					value: data?.default_ip_addresses?.[ 0 ] || '192.0.78.24',
				},
				{
					type: 'A',
					name: domain,
					value: data?.default_ip_addresses?.[ 1 ] || '192.0.78.25',
				},
				{
					type: 'CNAME',
					name: `www.${ domain }`,
					value: domain,
				},
		  ]
		: [
				{
					type: 'A',
					name: '@',
					value: data?.default_ip_addresses?.[ 0 ] || '192.0.78.24',
				},
				{
					type: 'A',
					name: '@',
					value: data?.default_ip_addresses?.[ 1 ] || '192.0.78.25',
				},
				{
					type: 'CNAME',
					name: 'www',
					value: domain,
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
						<h2>
							{ isSubdomainFlow
								? __( 'Update A & CNAME records' )
								: __( 'Update root A records & CNAME record' ) }
						</h2>

						<p>
							{ isSubdomainFlow
								? __(
										'Update the A and CNAME records for your subdomain to point to WordPress.com.'
								  )
								: __(
										"Update your domain's A records and CNAME record to point to WordPress.com."
								  ) }
						</p>

						<RecordsList records={ records } />

						<Card variant="secondary">
							<CardBody>
								<p>
									<strong>{ __( 'Important:' ) }</strong>{ ' ' }
									{ __(
										'Make sure to delete any existing A records or CNAME records that point to other services before adding these new records.'
									) }
								</p>
							</CardBody>
						</Card>

						<p>
							{ __(
								'After making these changes, it may take up to 72 hours for the changes to take effect.'
							) }
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
