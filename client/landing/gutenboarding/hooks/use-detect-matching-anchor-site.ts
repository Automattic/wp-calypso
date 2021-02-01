/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { USER_STORE } from '../stores/user';
import { useIsAnchorFm, useAnchorFmParams } from '../path';

interface AnchorEndpointResult {
	location: string | false;
}

// useDetectMatchingAnchorSite:
// If I'm making a new site and anchor parameters are available, check wpcom backend to
// see if there's already a site that belongs to me that matches these parameters.
// If it's found, redirect the browser to it
export default function useDetectMatchingAnchorSite(): void {
	const { anchorFmPodcastId, anchorFmEpisodeId, anchorFmSpotifyUrl } = useAnchorFmParams();
	const isAnchorFm = useIsAnchorFm();
	const currentUserExists = useSelect( ( select ) => !! select( USER_STORE ).getCurrentUser() );
	React.useEffect( () => {
		// Must be a logged-in user on anchor FM to check
		if ( ! isAnchorFm || ! currentUserExists ) {
			return;
		}

		// Build URL to Endpoint
		const anchorEndpointBase = '/anchor';
		const queryParts = {
			podcast: anchorFmPodcastId,
			episode: anchorFmEpisodeId,
			spotify_url: anchorFmSpotifyUrl,
		};
		const anchorEndpointUrl = addQueryArgs( anchorEndpointBase, queryParts );

		// Hit Endpoint
		wpcom.req
			.get( {
				path: anchorEndpointUrl,
				method: 'GET',
				apiNamespace: 'wpcom/v2',
			} )
			.then( ( result: AnchorEndpointResult ) => {
				if ( result?.location ) {
					window.location.href = result.location;
				}
			} );
	}, [ isAnchorFm, currentUserExists, anchorFmPodcastId, anchorFmEpisodeId, anchorFmSpotifyUrl ] );
}
