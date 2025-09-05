import { DomainGlueRecord } from '@automattic/api-core';
import { domainGlueRecordsQuery, domainGlueRecordUpdateMutation } from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../app/analytics';
import { domainRoute, domainGlueRecordsRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DomainGlueRecordsForm from './form';

export default function EditDomainGlueRecords() {
	const navigate = useNavigate();
	const { domainName, nameServer } = domainRoute.useParams();
	const { data: glueRecordsData } = useSuspenseQuery( domainGlueRecordsQuery( domainName ) );
	const updateMutation = useMutation( domainGlueRecordUpdateMutation( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();
	const glueRecord = glueRecordsData.find(
		( glueRecord: DomainGlueRecord ) => glueRecord.nameserver === nameServer
	);

	const handleSubmit = ( updatedGlueRecord: DomainGlueRecord ) => {
		updateMutation.mutate( updatedGlueRecord, {
			onSuccess: () => {
				createSuccessNotice( __( 'Glue record updated successfully.' ), {
					type: 'snackbar',
				} );

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
				createErrorNotice( __( 'Failed to update glue record.' ), { type: 'snackbar' } );

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
		<PageLayout size="small" header={ <PageHeader title={ __( 'Edit glue record' ) } /> }>
			<DomainGlueRecordsForm
				domainName={ domainName }
				initialData={ glueRecord }
				onSubmit={ handleSubmit }
				isSubmitting={ updateMutation.isPending }
				isEdit
				submitButtonText={ __( 'Update glue record' ) }
			/>
		</PageLayout>
	);
}
