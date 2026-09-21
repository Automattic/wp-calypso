import {
	activeAgencyQuery,
	agencySiteRemoveMutation,
	agencySitesQueryKey,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import Notice from '../../components/notice';
import { getDisplayUrl } from './dataviews/site-data';
import type { AgencySite } from '@automattic/api-core';

// How long the backend takes to drop a removed site from the agency's list.
const SITE_INDEXING_DELAY_MS = 1000;

export default function RemoveSiteModal( {
	site,
	closeModal,
}: {
	site: AgencySite;
	closeModal?: () => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const queryClient = useQueryClient();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const removeSite = useMutation( agencySiteRemoveMutation( agency?.id ) );

	useEffect( () => {
		recordTracksEvent( 'calypso_dashboard_agency_sites_remove_site_dialog_open' );
	}, [ recordTracksEvent ] );

	// The endpoint keys off the agency's own site id, which the profile only
	// carries once the site is fully managed.
	const agencySiteId = site.a4a_site_id;
	// The agency is loaded by the screen behind this modal, but the request needs
	// its id, so hold the button back until it lands rather than failing the call.
	const canRemove = !! agencySiteId && !! agency?.id;

	const handleRemove = () => {
		if ( ! agencySiteId || ! agency?.id ) {
			return;
		}

		recordTracksEvent( 'calypso_dashboard_agency_sites_remove_site_confirm' );

		removeSite.mutate( agencySiteId, {
			onSuccess: () => {
				// Invalidating here rather than in the mutation factory reads whichever
				// QueryClient is in context, and keeps the delay below out of the
				// shared data layer.
				const refreshSites = () =>
					queryClient.invalidateQueries( { queryKey: agencySitesQueryKey } );

				// The removed site can still come back in the first refresh, so settle
				// on the real list with a second one.
				refreshSites();
				setTimeout( refreshSites, SITE_INDEXING_DELAY_MS );

				createSuccessNotice( __( 'The site has been successfully removed.' ), {
					type: 'snackbar',
				} );
				closeModal?.();
			},
			onError: ( error: Error ) =>
				createErrorNotice( error.message || __( 'Failed to remove the site. Please try again.' ), {
					type: 'snackbar',
				} ),
		} );
	};

	return (
		<VStack spacing={ 6 }>
			<Text>
				{ createInterpolateElement(
					__(
						'<siteUrl /> will no longer appear in your agency dashboard. The site and its licenses are left untouched, and you can add it back later.'
					),
					{ siteUrl: <strong>{ getDisplayUrl( site ) }</strong> }
				) }
			</Text>
			{ ! agencySiteId && (
				<Notice variant="error">
					{ sprintf(
						/* translators: %s is a site address, e.g. example.com */
						__( '%s can’t be removed yet because it is still being set up.' ),
						getDisplayUrl( site )
					) }
				</Notice>
			) }
			<ButtonStack justify="flex-end">
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					onClick={ closeModal }
					disabled={ removeSite.isPending }
				>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					isDestructive
					isBusy={ removeSite.isPending }
					disabled={ removeSite.isPending || ! canRemove }
					onClick={ handleRemove }
				>
					{ __( 'Remove site' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
