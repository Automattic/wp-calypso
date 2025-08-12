import page from '@automattic/calypso-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import { siteByIdQuery } from 'calypso/dashboard/app/queries/site';
import {
	isDeletingStagingSiteQuery,
	hasStagingSiteQuery,
} from 'calypso/dashboard/app/queries/site-staging-sites';
import { getProductionSiteId } from 'calypso/dashboard/utils/site-staging-site';
import deleteStagingSiteIllustration from './delete-staging-site-illustration.svg';
import { StagingSiteBannerWrapper } from './staging-site-banner-wrapper';

interface StagingSiteDeletionBannerProps {
	siteId: number;
}

export function StagingSiteDeletionBanner( { siteId }: StagingSiteDeletionBannerProps ) {
	const heading = __( 'Deleting staging site' );

	const queryClient = useQueryClient();
	const { createSuccessNotice } = useDispatch( noticesStore );

	// Fetch the current site data
	const { data: site } = useQuery( {
		...siteByIdQuery( siteId ),
		enabled: !! siteId,
	} );

	const productionSiteId = Number( site ? getProductionSiteId( site ) : 0 );

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
		if ( hasStagingSite !== undefined && ! hasStagingSite && productionSite?.slug && site ) {
			queryClient.removeQueries( isDeletingStagingSiteQuery( site.ID ) );

			// Clear the staging site query to stop polling
			queryClient.removeQueries( hasStagingSiteQuery( productionSiteId ) );

			// Staging site has been deleted, redirect to production site
			page( `/overview/${ productionSite.slug }` );
			createSuccessNotice( __( 'Staging site deleted.' ), { type: 'snackbar' } );
		}
	}, [ hasStagingSite, productionSite, queryClient, productionSiteId, createSuccessNotice, site ] );

	return (
		<StagingSiteBannerWrapper>
			<HStack spacing={ 4 }>
				<VStack>
					<Heading level={ 1 } weight={ 500 }>
						{ heading }
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
				<img src={ deleteStagingSiteIllustration } alt={ heading } />
			</HStack>
		</StagingSiteBannerWrapper>
	);
}
