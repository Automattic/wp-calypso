import page from '@automattic/calypso-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect } from 'react';
import { siteByIdQuery } from 'calypso/dashboard/app/queries/site';
import {
	isDeletingStagingSiteQuery,
	hasStagingSiteQuery,
} from 'calypso/dashboard/app/queries/site-staging-sites';
import { getProductionSiteId } from 'calypso/dashboard/utils/site-staging-site';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import deleteStagingSiteIllustration from './delete-staging-site-illustration.svg';
import { StagingSiteBannerWrapper } from './staging-site-banner-wrapper';

interface StagingSiteDeletionBannerProps {
	siteId: number;
}

export function StagingSiteDeletionBanner( { siteId }: StagingSiteDeletionBannerProps ) {
	const heading = __( 'Deleting staging site' );

	const queryClient = useQueryClient();
	const dispatch = useDispatch();

	const { data: site } = useQuery( {
		...siteByIdQuery( siteId ),
		enabled: !! siteId,
	} );

	const productionSiteId = Number( site ? getProductionSiteId( site ) : 0 );

	const { data: hasStagingSite } = useQuery( {
		...hasStagingSiteQuery( productionSiteId ),
		refetchInterval: 3000,
		enabled: !! productionSiteId,
	} );
	const { data: productionSite } = useQuery( {
		...siteByIdQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );

	useEffect( () => {
		if ( hasStagingSite !== undefined && ! hasStagingSite && productionSite?.slug && site ) {
			queryClient.removeQueries( isDeletingStagingSiteQuery( site.ID ) );
			queryClient.removeQueries( hasStagingSiteQuery( productionSiteId ) );
			page( `/overview/${ productionSite.slug }` );
			dispatch( successNotice( __( 'Staging site deleted.' ) ) );
		}
	}, [ hasStagingSite, productionSite, queryClient, productionSiteId, dispatch, site ] );

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
