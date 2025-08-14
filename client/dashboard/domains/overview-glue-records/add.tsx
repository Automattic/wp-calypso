import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { domainGlueRecordCreateMutation } from '../../app/queries/domain-glue-records';
import { domainRoute, domainGlueRecordsRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DomainGlueRecordsForm from './form';
import type { FormData } from './form';

export default function AddDomainGlueRecords() {
	const router = useRouter();
	const { domainName } = domainRoute.useParams();
	const createMutation = useMutation( domainGlueRecordCreateMutation( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const handleSubmit = ( formData: FormData ) => {
		const glueRecord = {
			nameserver: formData.nameServer,
			ip_addresses: [ formData.ipAddress ],
		};

		createMutation.mutate( glueRecord, {
			onSuccess: () => {
				createSuccessNotice( __( 'Glue record created successfully.' ), {
					type: 'snackbar',
				} );
				router.navigate( {
					to: domainGlueRecordsRoute.fullPath,
					params: { domainName },
				} );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to create glue record.' ), { type: 'snackbar' } );
			},
		} );
	};

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Add glue record' ) } /> }>
			<DomainGlueRecordsForm
				domainName={ domainName }
				onSubmit={ handleSubmit }
				isSubmitting={ createMutation.isPending }
				submitButtonText={ __( 'Add record' ) }
			/>
		</PageLayout>
	);
}
