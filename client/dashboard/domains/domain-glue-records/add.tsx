import { DomainGlueRecord } from '@automattic/api-core';
import { domainGlueRecordCreateMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __, sprintf } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainRoute, domainGlueRecordsRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DomainGlueRecordsForm from './form';

export default function AddDomainGlueRecords() {
	const navigate = useNavigate();
	const { domainName } = domainRoute.useParams();
	const createMutation = useMutation( {
		...domainGlueRecordCreateMutation( domainName ),
		meta: {
			snackbar: {
				/* translators: %s is the domain name */
				success: sprintf( __( 'Glue record for %s saved.' ), domainName ),
				error: { source: 'server' },
			},
		},
	} );
	const { recordTracksEvent } = useAnalytics();

	const handleSubmit = ( glueRecord: DomainGlueRecord ) => {
		createMutation.mutate( glueRecord, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_dashboard_domain_glue_records_add_record', {
					domain: domainName,
					nameserver: glueRecord.nameserver,
					address: glueRecord.ip_addresses[ 0 ],
				} );

				navigate( {
					to: domainGlueRecordsRoute.fullPath,
					params: { domainName },
				} );
			},
			onError: ( error: Error ) => {
				recordTracksEvent( 'calypso_dashboard_domain_glue_records_add_record_failure', {
					domain: domainName,
					nameserver: glueRecord.nameserver,
					address: glueRecord.ip_addresses[ 0 ],
					error_message: error.message,
				} );
			},
		} );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					description={ __( 'Add a glue record for your domain’s name servers.' ) }
				/>
			}
		>
			<DomainGlueRecordsForm
				domainName={ domainName }
				onSubmit={ handleSubmit }
				isSubmitting={ createMutation.isPending }
				submitButtonText={ __( 'Add record' ) }
			/>
		</PageLayout>
	);
}
