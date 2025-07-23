import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Card,
	CardBody,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import { siteByIdQuery } from '../../app/queries/site';
import { stagingSiteDeleteStatusQuery } from '../../app/queries/site-staging-sites';
import PageLayout from '../../components/page-layout';
import deleteStagingSiteIllustration from './delete-staging-site-illustration.svg';
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
	}, [ stagingSiteData, productionSite, router, queryClient, productionSiteId, createSuccessNotice ] );

	return (
		<PageLayout>
			<Card>
				<CardBody style={ { padding: '40px' } }>
					<HStack spacing={ 4 }>
						<VStack>
							<Heading level={ 1 } weight={ 500 }>
								{ __( 'Deleting staging site' ) }
							</Heading>
							<Text as="p" variant="muted">
								{ __(
									'We’re permanently deleting your staging site. Your live site is safe and won’t be affected.'
								) }
							</Text>
							<Text as="p" variant="muted">
								{ __( 'Hang tight, this may take a few moments.' ) }
							</Text>
						</VStack>
						<img src={ deleteStagingSiteIllustration } alt={ __( 'Deleting staging site' ) } />
					</HStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
