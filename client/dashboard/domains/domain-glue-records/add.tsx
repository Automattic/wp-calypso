import { DomainGlueRecord } from '@automattic/api-core';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { domainGlueRecordCreateMutation } from '../../app/queries/domain-glue-records';
import { domainRoute, domainGlueRecordsRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DomainGlueRecordsForm from './form';

export default function AddDomainGlueRecords() {
	const navigate = useNavigate();
	const { domainName } = domainRoute.useParams();
	const createMutation = useMutation( domainGlueRecordCreateMutation( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const handleSubmit = ( glueRecord: DomainGlueRecord ) => {
		createMutation.mutate( glueRecord, {
			onSuccess: () => {
				createSuccessNotice( __( 'Glue record created successfully.' ), {
					type: 'snackbar',
				} );
				navigate( {
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
