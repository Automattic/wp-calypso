import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Spinner,
	Notice,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import { siteByIdQuery } from '../../app/queries/site';
import { stagingSiteDeleteStatusQuery } from '../../app/queries/site-staging-sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import type { Site } from '../../data/types';

export default function StagingSiteDeleteBanner( { site }: { site: Site } ) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { createSuccessNotice } = useDispatch( noticesStore );
	const productionSiteId = site.options?.wpcom_production_blog_id;

	// Poll for staging site deletion status
	const { data: stagingSiteData } = useQuery( {
		...stagingSiteDeleteStatusQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );

	// Fetch production site data for redirect
	const { data: productionSite } = useQuery( {
		...siteByIdQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );

	// Redirect to the production site when the staging site is deleted
	useEffect( () => {
		if (
			stagingSiteData &&
			Array.isArray( stagingSiteData ) &&
			stagingSiteData.length === 0 &&
			productionSite?.slug
		) {
			// Clear the mutation state to prevent banner from showing after redirect
			queryClient.getMutationCache().clear();

			// Also clear the staging site delete status query
			queryClient.removeQueries( {
				queryKey: [ 'staging-site-delete-status', productionSiteId ],
			} );

			// Staging site has been deleted, redirect to production site
			router.navigate( {
				to: '/$siteSlug',
				params: { siteSlug: productionSite.slug },
			} );
			createSuccessNotice( __( 'Staging site deleted.' ), { type: 'snackbar' } );
		}
	}, [ stagingSiteData, productionSite, router, queryClient, productionSiteId ] );

	return (
		<PageLayout size="small" header={ <PageHeader title={ __( 'Staging Site Deletion' ) } /> }>
			<VStack spacing={ 4 }>
				<Notice status="info">
					<VStack spacing={ 2 }>
						<div style={ { display: 'flex', alignItems: 'center', gap: '8px' } }>
							<Spinner />
							<Text>{ __( 'Staging site deletion in progress…' ) }</Text>
						</div>
						<Text variant="muted">
							{ __(
								'You will be redirected to the production site when the deletion is complete.'
							) }
						</Text>
					</VStack>
				</Notice>
			</VStack>
		</PageLayout>
	);
}
