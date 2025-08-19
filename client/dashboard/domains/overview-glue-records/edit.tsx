import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import {
	domainGlueRecordsQuery,
	domainGlueRecordUpdateMutation,
} from '../../app/queries/domain-glue-records';
import { domainRoute, domainGlueRecordsRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { DomainGlueRecord } from '../../data/domain-glue-records';
import DomainGlueRecordsForm from './form';
import type { FormData } from './form';

export default function EditDomainGlueRecords() {
	const navigate = useNavigate();
	const { domainName, nameServer } = domainRoute.useParams();
	const { data: glueRecordsData } = useSuspenseQuery( domainGlueRecordsQuery( domainName ) );
	const updateMutation = useMutation( domainGlueRecordUpdateMutation( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const glueRecord = glueRecordsData.find(
		( glueRecord: DomainGlueRecord ) => glueRecord.nameserver === nameServer
	);

	const handleSubmit = ( formData: FormData ) => {
		const updatedGlueRecord: DomainGlueRecord = {
			nameserver: formData.nameServer,
			ip_addresses: [ formData.ipAddress ],
		};

		updateMutation.mutate( updatedGlueRecord, {
			onSuccess: () => {
				createSuccessNotice( __( 'Glue record updated successfully.' ), {
					type: 'snackbar',
				} );
				navigate( {
					to: domainGlueRecordsRoute.fullPath,
					params: { domainName },
				} );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to update glue record.' ), { type: 'snackbar' } );
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
