import {
	siteByIdQuery,
	stagingSiteCreateMutation,
	isDeletingStagingSiteQuery,
	hasStagingSiteQuery,
	hasValidQuotaQuery,
	jetpackConnectionHealthQuery,
	siteLatestAtomicTransferQuery,
	isCreatingStagingSiteQuery,
	siteBySlugQuery,
} from '@automattic/api-queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { sprintf, __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useHelpCenter } from '../../app/help-center';
import {
	isAtomicTransferInProgress,
	isAtomicTransferredSite,
} from '../../utils/site-atomic-transfers';
import { getProductionSiteId, getStagingSiteId } from '../../utils/site-staging-site';
import type { EnvironmentType } from '../../components/environment';
import type { Site } from '@automattic/api-core';

export default function useStagingSite( site: Site ) {
	const { recordTracksEvent } = useAnalytics();
	const queryClient = useQueryClient();

	const productionSiteId = getProductionSiteId( site );

	const { data: productionSite } = useQuery( {
		...siteByIdQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );

	const stagingSiteId = getStagingSiteId( productionSite ?? site );

	const { data: isStagingSiteCreating } = useQuery( {
		...isCreatingStagingSiteQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
	} );

	const { data: atomicTransfer } = useQuery( {
		...siteLatestAtomicTransferQuery( stagingSiteId ?? 0 ),
		refetchInterval: ( query ) => {
			return isAtomicTransferInProgress( query.state.data?.status ?? 'pending' ) ? 2000 : false;
		},
		enabled: isStagingSiteCreating && !! stagingSiteId,
	} );
	const transferStatus = atomicTransfer?.status;

	const { data: stagingSite } = useQuery( {
		...siteByIdQuery( stagingSiteId ?? 0 ),
		refetchInterval: ( query ) => {
			if ( ! query.state.data ) {
				return 0;
			}

			return isAtomicTransferredSite( query.state.data ) ? false : 2000;
		},
		enabled: !! stagingSiteId && transferStatus === 'completed',
	} );

	const { data: isStagingSiteDeleting } = useQuery( {
		...isDeletingStagingSiteQuery( stagingSiteId ?? 0 ),
		enabled: !! stagingSiteId,
	} );

	// Staging site deletion process runs via async job. We need to keep on polling for the staging site deletion before we start displaying the button to add a staging site again
	const { data: stagingSiteExistsFromQuery } = useQuery( {
		...hasStagingSiteQuery( productionSiteId ?? 0 ),
		refetchInterval: isStagingSiteDeleting ? 3000 : false,
		enabled: !! productionSiteId && isStagingSiteDeleting,
	} );

	const { createSuccessNotice, createNotice, createErrorNotice } = useDispatch( noticesStore );

	// Clean up deletion flag when staging site no longer exists
	useEffect( () => {
		const invalidateQueries = async (
			productionSiteId: number,
			productionSiteSlug: string,
			stagingSiteId: number
		) => {
			// Ensure the new site is retrieved before invalidating the deletion flag
			await queryClient.invalidateQueries( siteByIdQuery( productionSiteId ) );
			await queryClient.invalidateQueries( siteBySlugQuery( productionSiteSlug ) );
			await queryClient.invalidateQueries( isDeletingStagingSiteQuery( stagingSiteId ) );
		};
		if (
			isStagingSiteDeleting &&
			stagingSiteExistsFromQuery === false &&
			productionSiteId &&
			productionSite &&
			stagingSiteId
		) {
			createSuccessNotice( __( 'Staging site deleted.' ), {
				type: 'snackbar',
				id: 'staging-site-deleted',
			} );
			invalidateQueries( productionSiteId, productionSite?.slug, stagingSiteId );
		}
	}, [
		isStagingSiteDeleting,
		stagingSiteExistsFromQuery,
		queryClient,
		stagingSiteId,
		productionSiteId,
		productionSite,
		createSuccessNotice,
	] );

	const { setShowHelpCenter, setNavigateToRoute } = useHelpCenter();

	const isStagingSiteReady =
		isStagingSiteCreating && stagingSite && isAtomicTransferredSite( stagingSite );

	useEffect( () => {
		if ( ! stagingSite ) {
			return;
		}
		if ( isStagingSiteReady ) {
			createSuccessNotice( __( 'Staging site added.' ), {
				type: 'snackbar',
				explicitDismiss: true,
				id: 'staging-site-added',
			} );
			productionSite && queryClient.invalidateQueries( siteBySlugQuery( productionSite.slug ) );
			queryClient.setQueryData(
				isCreatingStagingSiteQuery( productionSiteId ?? 0 ).queryKey,
				false
			);
		}
	}, [
		queryClient,
		isStagingSiteReady,
		stagingSite,
		createSuccessNotice,
		productionSiteId,
		productionSite,
	] );

	const mutation = useMutation( stagingSiteCreateMutation( productionSite?.ID ?? 0 ) );

	const { data: hasValidQuota, error: isErrorValidQuota } = useQuery( {
		...hasValidQuotaQuery( productionSite?.ID ?? 0 ),
		enabled: !! productionSite?.ID && ! stagingSite && ! isStagingSiteCreating,
		meta: {
			persist: false,
		},
	} );

	const { data: connectionHealth } = useQuery( {
		...jetpackConnectionHealthQuery( productionSite?.ID ?? 0 ),
		enabled: !! productionSite?.ID && ! stagingSite && ! isStagingSiteCreating,
	} );

	const handleAddStagingSite = () => {
		recordTracksEvent( 'calypso_hosting_configuration_staging_site_add_click' );

		if ( isErrorValidQuota ) {
			createNotice(
				'error',
				__( 'Cannot add a staging site due to site quota validation issue.' ),
				{
					type: 'snackbar',
					actions: [
						{
							label: __( 'Contact support' ),
							url: null,
							onClick: () => {
								setNavigateToRoute( '/odie' );
								setShowHelpCenter( true );
							},
						},
					],
				}
			);
			return;
		}

		if ( ! hasValidQuota ) {
			createErrorNotice(
				__(
					'Your available storage space is below 50%, which is insufficient for creating a staging site.'
				),
				{
					type: 'snackbar',
				}
			);
			return;
		}

		if ( ! connectionHealth?.is_healthy ) {
			createNotice( 'error', __( 'Cannot add a staging site due to a Jetpack connection issue.' ), {
				type: 'snackbar',
				actions: [
					{
						label: __( 'Contact support' ),
						url: null,
						onClick: () => {
							setNavigateToRoute( '/odie' );
							setShowHelpCenter( true );
						},
					},
				],
			} );
			return;
		}

		createSuccessNotice(
			__(
				'Setting up your staging site — this may take a few minutes. We’ll email you when it’s ready.'
			),
			{
				type: 'snackbar',
			}
		);

		mutation.mutate( undefined, {
			onSuccess: () => {
				queryClient.invalidateQueries( siteByIdQuery( productionSiteId ?? 0 ) );
				queryClient.invalidateQueries( hasStagingSiteQuery( productionSiteId ?? 0 ) );
			},
			onError: ( error: Error ) => {
				recordTracksEvent( 'calypso_hosting_configuration_staging_site_add_failure' );
				createErrorNotice(
					sprintf(
						// translators: "reason" is why adding the staging site failed.
						__( 'Failed to create staging site: %(reason)s' ),
						{ reason: error.message }
					),
					{
						type: 'snackbar',
					}
				);
			},
		} );
	};

	const environmentType: EnvironmentType = site.is_wpcom_staging_site ? 'staging' : 'production';

	return {
		productionSite,
		stagingSite,
		isStagingSiteCreating: !! isStagingSiteCreating,
		isStagingSiteDeleting: !! isStagingSiteDeleting,
		handleAddStagingSite,
		environmentType,
	};
}
