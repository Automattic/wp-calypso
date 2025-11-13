import { domainQuery, domainForwardingSaveMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import Breadcrumbs from '../../app/breadcrumbs';
import { domainRoute, domainForwardingRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import DomainForwardingForm from './form';
import { DomainForwardingNotice } from './notice';
import { formDataToSubmitData } from './utils';
import type { FormData } from './form';
import type { DomainForwardingSaveData } from '@automattic/api-core';

export default function AddDomainForwarding() {
	const router = useRouter();
	const { domainName } = domainRoute.useParams();
	const saveMutation = useMutation( {
		...domainForwardingSaveMutation( domainName ),
		meta: {
			snackbar: {
				success: __( 'Domain forwarding rule saved.' ),
				error: { source: 'server' },
			},
		},
	} );
	const { data: domainData } = useSuspenseQuery( domainQuery( domainName ) );
	const forceSubdomainsOnly = domainData?.primary_domain && ! domainData?.is_domain_only_site;

	const handleSubmit = ( formData: FormData ) => {
		const submitData: DomainForwardingSaveData = formDataToSubmitData( formData );

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
		<PageLayout size="small" header={ <PageHeader prefix={ <Breadcrumbs length={ 3 } /> } /> }>
			<DomainForwardingNotice domainName={ domainName } domainData={ domainData } />
			<DomainForwardingForm
				domainName={ domainName }
				onSubmit={ handleSubmit }
				isSubmitting={ saveMutation.isPending }
				submitButtonText={ __( 'Add' ) }
				forceSubdomain={ forceSubdomainsOnly }
			/>
		</PageLayout>
	);
}
