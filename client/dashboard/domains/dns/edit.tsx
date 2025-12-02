import { domainDnsMutation, domainDnsQuery, domainQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DnsDescription from '../domain-dns/dns-description';
import { DomainDnsNameserversNotice } from '../domain-dns/notice';
import DNSRecordForm from './form';
import { DNS_RECORD_CONFIGS } from './records/dns-record-configs';
import { getProcessedRecord } from './utils';
import type { DnsRecordTypeFormData, DnsRecordFormData } from './records/dns-record-configs';
import type { DnsRecord } from '@automattic/api-core';

export default function DomainEditDNS() {
	const navigate = useNavigate();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { recordId } = domainRoute.useSearch();
	const mutation = useMutation( domainDnsMutation( domainName ) );

	const { data: dnsRecords } = useSuspenseQuery( domainDnsQuery( domainName ) );
	const recordToEdit = getProcessedRecord(
		// This record's existence is checked in the `beforeLoad` function in the route
		dnsRecords.records.find( ( record ) => record.id === recordId )!
	);

	const navigateToDNSOverviewPage = () => {
		navigate( {
			to: '/domains/$domainName/dns',
			params: { domainName },
		} );
	};

	const handleSubmit = ( typeFormData: DnsRecordTypeFormData, formData: DnsRecordFormData ) => {
		const config = DNS_RECORD_CONFIGS[ typeFormData.type ];
		const recordToAdd = config.transformData( formData, domainName, typeFormData.type );

		const recordsToAdd: DnsRecord[] = [ recordToAdd ];
		const recordsToRemove: DnsRecord[] = [ recordToEdit ];

		mutation.mutate(
			{ recordsToAdd, recordsToRemove },
			{
				onSuccess: () => {
					createSuccessNotice( __( 'DNS record updated successfully.' ), { type: 'snackbar' } );
					navigateToDNSOverviewPage();
				},
				onError: () => {
					// TODO: Get DNS exception class and display correct error message
					createErrorNotice( __( 'Failed to update DNS record.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader prefix={ <Breadcrumbs length={ 3 } /> } description={ <DnsDescription /> } />
			}
		>
			<DomainDnsNameserversNotice domainName={ domainName } domain={ domain } />
			<DNSRecordForm
				domainName={ domainName }
				isBusy={ mutation.isPending }
				submitButtonText={ __( 'Update DNS record' ) }
				onSubmit={ handleSubmit }
				recordToEdit={ recordToEdit }
				navigateToDNSOverviewPage={ navigateToDNSOverviewPage }
			/>
		</PageLayout>
	);
}
