import {
	domainQuery,
	domainForwardingQuery,
	domainForwardingSaveMutation,
} from '@automattic/api-queries';
import { useSuspenseQuery, useMutation } from '@tanstack/react-query';
import { notFound, useRouter } from '@tanstack/react-router';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { domainRoute, domainForwardingRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DomainForwardingForm from './form';
import { DomainForwardingNotice } from './notice';
import { formDataToSubmitData } from './utils';
import type { FormData } from './form';
import type { DomainForwardingSaveData } from '@automattic/api-core';

export default function EditDomainForwarding() {
	const router = useRouter();
	const { domainName, forwardingId } = domainRoute.useParams();
	const { data: forwardingData } = useSuspenseQuery( domainForwardingQuery( domainName ) );
	const saveMutation = useMutation( {
		...domainForwardingSaveMutation( domainName ),
		meta: {
			snackbar: {
				success: __( 'Domain forwarding rule saved.' ),
				error: __( 'Failed to save domain forwarding rule.' ),
			},
		},
	} );
	const { data: domainData } = useSuspenseQuery( domainQuery( domainName ) );
	const forceSubdomainsOnly = domainData?.primary_domain && ! domainData?.is_domain_only_site;

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
				router.navigate( {
					to: domainForwardingRoute.fullPath,
					params: { domainName },
				} );
			},
		} );
	};

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Edit domain forwarding' ) } /> }>
			<DomainForwardingNotice domainName={ domainName } domainData={ domainData } />
			<DomainForwardingForm
				domainName={ domainName }
				initialData={ existingForwarding }
				onSubmit={ handleSubmit }
				isSubmitting={ saveMutation.isPending }
				submitButtonText={ __( 'Update' ) }
				forceSubdomain={ forceSubdomainsOnly && !! existingForwarding.subdomain }
			/>
		</PageLayout>
	);
}
