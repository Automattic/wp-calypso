import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { domainForwardingSaveMutation } from '../../app/queries/domain-forwarding';
import { domainRoute, domainForwardingsRoute } from '../../app/router';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DomainForwardingForm from './form';
import { formDataToSubmitData } from './utils';
import type { FormData } from './form';
import type { DomainForwardingSaveData } from '../../data/domain-forwarding';

export default function AddDomainForwarding() {
	const router = useRouter();
	const { domainName } = domainRoute.useParams();
	const saveMutation = useMutation( domainForwardingSaveMutation( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const handleSubmit = ( formData: FormData ) => {
		const submitData: DomainForwardingSaveData = formDataToSubmitData( formData );

		saveMutation.mutate( submitData, {
			onSuccess: () => {
				createSuccessNotice( __( 'Domain forwarding rule created successfully.' ), {
					type: 'snackbar',
				} );
				router.navigate( {
					to: domainForwardingsRoute.fullPath,
					params: { domainName },
				} );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to create domain forwarding rule.' ), { type: 'snackbar' } );
			},
		} );
	};

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Add Domain Forwarding' ) } /> }>
			<DomainForwardingForm
				domainName={ domainName }
				onSubmit={ handleSubmit }
				isSubmitting={ saveMutation.isPending }
				submitButtonText={ __( 'Add' ) }
			/>
		</PageLayout>
	);
}
