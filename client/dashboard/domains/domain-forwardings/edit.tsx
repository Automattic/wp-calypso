import { useQuery, useMutation } from '@tanstack/react-query';
import { notFound, useRouter } from '@tanstack/react-router';
import { useDispatch } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import {
	domainForwardingQuery,
	domainForwardingSaveMutation,
} from '../../app/queries/domain-forwarding';
import { domainRoute, domainForwardingsRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DomainForwardingForm from './form';
import { formDataToSubmitData } from './utils';
import type { FormData } from './form';
import type { DomainForwardingSaveData } from '../../data/domain-forwarding';

export default function EditDomainForwarding() {
	const router = useRouter();
	const { domainName, forwardingId } = domainRoute.useParams();
	const { data: forwardingData } = useQuery( domainForwardingQuery( domainName ) );
	const saveMutation = useMutation( domainForwardingSaveMutation( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	// Find existing forwarding
	const existingForwarding = useMemo( () => {
		if ( ! forwardingData || ! forwardingId ) {
			throw notFound();
		}
		const existingForwarding = forwardingData.find(
			( f ) => f.domain_redirect_id === parseInt( forwardingId, 10 )
		);
		if ( ! existingForwarding ) {
			throw notFound();
		}
		return existingForwarding;
	}, [ forwardingData, forwardingId ] );

	const handleSubmit = ( formData: FormData ) => {
		if ( ! existingForwarding ) {
			return;
		}

		const submitData: DomainForwardingSaveData = formDataToSubmitData(
			formData,
			existingForwarding
		);

		saveMutation.mutate( submitData, {
			onSuccess: () => {
				createSuccessNotice( __( 'Domain forwarding rule updated successfully.' ), {
					type: 'snackbar',
				} );
				router.navigate( {
					to: domainForwardingsRoute.fullPath,
					params: { domainName },
				} );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to update domain forwarding rule.' ), { type: 'snackbar' } );
			},
		} );
	};

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Edit Domain Forwarding' ) } /> }>
			<DomainForwardingForm
				domainName={ domainName }
				initialData={ existingForwarding }
				onSubmit={ handleSubmit }
				isSubmitting={ saveMutation.isPending }
				submitButtonText={ __( 'Update' ) }
			/>
		</PageLayout>
	);
}
