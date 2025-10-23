import { DomainGlueRecord } from '@automattic/api-core';
import { domainGlueRecordsQuery, domainGlueRecordUpdateMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainRoute, domainGlueRecordsRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DomainGlueRecordsForm from './form';

export default function EditDomainGlueRecords() {
	const navigate = useNavigate();
	const { domainName, nameServer } = domainRoute.useParams();
	const { data: glueRecordsData } = useSuspenseQuery( domainGlueRecordsQuery( domainName ) );
	const updateMutation = useMutation( {
		...domainGlueRecordUpdateMutation( domainName ),
		meta: {
			snackbar: {
				success: __( 'Glue record saved.' ),
				error: __( 'Failed to save glue record.' ),
			},
		},
	} );
	const { recordTracksEvent } = useAnalytics();
	const glueRecord = glueRecordsData.find(
		( glueRecord: DomainGlueRecord ) => glueRecord.nameserver === nameServer
	);

	const handleSubmit = ( updatedGlueRecord: DomainGlueRecord ) => {
		updateMutation.mutate( updatedGlueRecord, {
			onSuccess: () => {
				recordTracksEvent( 'calypso_dashboard_domain_glue_records_update_record', {
					domain: domainName,
					nameserver: updatedGlueRecord.nameserver,
					address: updatedGlueRecord.ip_addresses[ 0 ],
				} );

				navigate( {
					to: domainGlueRecordsRoute.fullPath,
					params: { domainName },
				} );
			},
			onError: ( error ) => {
				recordTracksEvent( 'calypso_dashboard_domain_glue_records_update_record_failure', {
					domain: domainName,
					nameserver: updatedGlueRecord.nameserver,
					address: updatedGlueRecord.ip_addresses[ 0 ],
					error_message: error.message,
				} );
			},
		} );
	};

	return (
		<PageLayout size="small" header={ <PageHeader prefix={ <Breadcrumbs length={ 3 } /> } /> }>
			<DomainGlueRecordsForm
				domainName={ domainName }
				initialData={ glueRecord }
				onSubmit={ handleSubmit }
				isSubmitting={ updateMutation.isPending }
				isEdit
				submitButtonText={ __( 'Update record' ) }
			/>
		</PageLayout>
	);
}
