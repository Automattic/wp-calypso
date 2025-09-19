import { domainDnsMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import {
	domainRoute,
	domainOverviewRoute,
	domainDnsRoute,
	domainDnsAddRoute,
} from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DNSRecordForm from './form';
import { DNS_RECORD_CONFIGS } from './records/dns-record-configs';
import type { DnsRecordTypeFormData, DnsRecordFormData } from './records/dns-record-configs';
import type { DnsRecord } from '@automattic/api-core';

export default function DomainAddDNS() {
	const navigate = useNavigate();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { domainName } = domainRoute.useParams();
	const mutation = useMutation( domainDnsMutation( domainName ) );

	const navigateToDNSOverviewPage = () => {
		navigate( {
			to: '/domains/$domainName/dns',
			params: { domainName },
		} );
	};

	const handleSubmit = ( typeFormData: DnsRecordTypeFormData, formData: DnsRecordFormData ) => {
		const config = DNS_RECORD_CONFIGS[ typeFormData.type ];
		const formattedData = config.transformData( formData, domainName, typeFormData.type );

		const recordsToAdd: DnsRecord[] = [ formattedData ];

		mutation.mutate(
			{ recordsToAdd },
			{
				onSuccess: () => {
					createSuccessNotice( __( 'DNS record added successfully.' ), { type: 'snackbar' } );
					navigateToDNSOverviewPage();
				},
				onError: () => {
					// TODO: Get DNS exception class and display correct error message
					createErrorNotice( __( 'Failed to add DNS record.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	const router = useRouter();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={
						<PageHeader.SubNavigation
							items={ [
								{
									label: __( 'Overview' ),
									href: router.buildLocation( {
										to: domainOverviewRoute.fullPath,
										params: { domainName },
									} ).href,
								},
								{
									label: __( 'DNS records' ),
									href: router.buildLocation( {
										to: domainDnsRoute.fullPath,
										params: { domainName },
									} ).href,
								},
								{
									label: __( 'Add a new DNS record' ),
									href: router.buildLocation( {
										to: domainDnsAddRoute.fullPath,
										params: { domainName },
									} ).href,
								},
							] }
						/>
					}
					title={ __( 'Add a new DNS record' ) }
				/>
			}
		>
			<DNSRecordForm
				domainName={ domainName }
				isBusy={ mutation.isPending }
				submitButtonText={ __( 'Add DNS record' ) }
				onSubmit={ handleSubmit }
				navigateToDNSOverviewPage={ navigateToDNSOverviewPage }
			/>
		</PageLayout>
	);
}
