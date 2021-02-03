/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';

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
export default function useDetectMatchingAnchorSite(): boolean {
	const { anchorFmPodcastId, anchorFmEpisodeId, anchorFmSpotifyUrl } = useAnchorFmParams();
	const isAnchorFm = useIsAnchorFm();
	const currentUserExists = useSelect( ( select ) => !! select( USER_STORE ).getCurrentUser() );
	const [ isLoading, setIsLoading ] = React.useState( !! ( isAnchorFm && currentUserExists ) );

	React.useEffect( () => {
		// Must be a logged-in user on anchor FM to check
		if ( ! isAnchorFm || ! currentUserExists ) {
			setIsLoading( false );
			return;
		}

		setIsLoading( true );
		wpcom
			.undocumented()
			.getMatchingAnchorSite( anchorFmPodcastId, anchorFmEpisodeId, anchorFmSpotifyUrl )
			.then( ( result: AnchorEndpointResult ) => {
				if ( result?.location ) {
					window.location.href = result.location;
				} else {
					setIsLoading( false );
				}
			} )
			.catch( () => {
				setIsLoading( false );
			} );
	}, [ isAnchorFm, currentUserExists, anchorFmPodcastId, anchorFmEpisodeId, anchorFmSpotifyUrl ] );
	return isLoading;
}
