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
import {
	isDeletingStagingSiteQuery,
	hasStagingSiteQuery,
} from '../../app/queries/site-staging-sites';
import PageLayout from '../../components/page-layout';
import deleteStagingSiteBackground from './delete-staging-site-background.svg';
import deleteStagingSiteIllustration from './delete-staging-site-illustration.svg';
import type { Site } from '../../data/types';

export default function StagingSiteDeleteBanner( { site }: { site: Site } ) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { createSuccessNotice } = useDispatch( noticesStore );
	const productionSiteId = site.options?.wpcom_production_blog_id ?? 0;

	// Poll for staging site status
	const { data: hasStagingSite } = useQuery( {
		...hasStagingSiteQuery( productionSiteId ),
		refetchInterval: 3000,
		enabled: !! productionSiteId,
	} );

	// Fetch production site data for redirect
	const { data: productionSite } = useQuery( {
		...siteByIdQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );

	// Redirect to the production site when the staging site is deleted
	useEffect( () => {
		if ( ! hasStagingSite && productionSite?.slug ) {
			queryClient.removeQueries( isDeletingStagingSiteQuery( site.ID ) );

			// Clear the staging site query to stop polling
			queryClient.removeQueries( hasStagingSiteQuery( productionSiteId ) );

			// Staging site has been deleted, redirect to production site
			router.navigate( {
				to: '/overview/$siteSlug',
				params: { siteSlug: productionSite.slug },
			} );
			createSuccessNotice( __( 'Staging site deleted.' ), { type: 'snackbar' } );
		}
	}, [
		hasStagingSite,
		productionSite,
		router,
		queryClient,
		productionSiteId,
		createSuccessNotice,
		site.ID,
	] );

	return (
		<PageLayout>
			<Card>
				<CardBody
					style={ {
						padding: '40px',
						background: `
							linear-gradient(
								to right,
								rgba( 255, 255, 255, 1 ) 0%,
								rgba( 255, 255, 255, 0.41 ) 59%,
								rgba( 255, 255, 255, 0 ) 100%
							),
							url(${ deleteStagingSiteBackground }) repeat
						`,
					} }
				>
					<HStack spacing={ 4 }>
						<VStack>
							<Heading level={ 1 } weight={ 500 }>
								{ __( 'Deleting staging site' ) }
							</Heading>
							<Text as="p" variant="muted">
								{ __(
									"We're permanently deleting your staging site. Your live site is safe and won't be affected."
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
