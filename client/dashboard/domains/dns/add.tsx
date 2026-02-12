import { domainDnsMutation, domainQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __, sprintf } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DnsDescription from '../domain-dns/dns-description';
import { DomainDnsNameserversNotice } from '../domain-dns/notice';
import DNSRecordForm from './form';
import { DNS_RECORD_CONFIGS } from './records/dns-record-configs';
import type { DnsRecordTypeFormData, DnsRecordFormData } from './records/dns-record-configs';
import type { DnsRecord } from '@automattic/api-core';

export default function DomainAddDNS() {
	const navigate = useNavigate();
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const mutation = useMutation( {
		...domainDnsMutation( domainName ),
		meta: {
			snackbar: {
				/* translators: %s is the domain name */
				success: sprintf( __( 'DNS record added successfully for %s.' ), domainName ),
				error: { source: 'server' },
			},
		},
	} );

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

		mutation.mutate( { recordsToAdd }, { onSuccess: () => navigateToDNSOverviewPage() } );
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
				submitButtonText={ __( 'Add DNS record' ) }
				onSubmit={ handleSubmit }
				navigateToDNSOverviewPage={ navigateToDNSOverviewPage }
			/>
		</PageLayout>
	);
}
