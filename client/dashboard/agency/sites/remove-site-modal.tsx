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
import { useEffect, useState } from 'react';
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
	// The mutation settles before the list has caught up, and the modal stays
	// open until it has, so the buttons follow this rather than `isPending`.
	const [ isRemoving, setIsRemoving ] = useState( false );

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
		setIsRemoving( true );

		const notifyFailure = ( message?: string ) => {
			setIsRemoving( false );
			createErrorNotice( message || __( 'Failed to remove site.' ), {
				type: 'snackbar',
			} );
		};

		removeSite.mutate( agencySiteId, {
			onSuccess: async ( success ) => {
				// The endpoint can answer 200 while declining the removal, so leave the
				// modal open rather than reporting one that didn't happen.
				if ( ! success ) {
					notifyFailure();
					return;
				}

				// Invalidating here rather than in the mutation factory keeps the delay
				// below out of the shared data layer, and lets the modal stay open
				// until the list it is sitting on top of has caught up.
				const refreshSites = () =>
					queryClient.invalidateQueries( { queryKey: agencySitesQueryKey } );

				// The removed site can still come back in the first refresh, so settle
				// on the real list with a second one.
				await refreshSites();
				await new Promise( ( resolve ) => setTimeout( resolve, SITE_INDEXING_DELAY_MS ) );
				await refreshSites();

				createSuccessNotice( __( 'Site removed.' ), {
					type: 'snackbar',
				} );
				closeModal?.();
			},
			onError: ( error: Error ) => notifyFailure( error.message ),
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
					disabled={ isRemoving }
				>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					isDestructive
					isBusy={ isRemoving }
					disabled={ isRemoving || ! canRemove }
					onClick={ handleRemove }
				>
					{ __( 'Remove site' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
