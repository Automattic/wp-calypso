import { useSelect } from '@wordpress/data';
import page from 'page';
import { useState, useEffect } from 'react';
import wpcom from 'calypso/lib/wp';
import { useIsAnchorFm, useAnchorFmParams } from '../path';
import { USER_STORE } from '../stores/user';

interface AnchorEndpointResult {
	location: string | false;
}

// useDetectMatchingAnchorSite:
// If I'm making a new site and anchor parameters are available, check wpcom backend to
// see if there's already a site that belongs to me that matches these parameters.
// If it's found, redirect the browser to it
export default function useDetectMatchingAnchorSite(): boolean {
	const {
		anchorFmPodcastId,
		anchorFmEpisodeId,
		anchorFmSpotifyUrl,
		anchorFmSite,
		anchorFmPost,
		anchorFmIsNewSite,
	} = useAnchorFmParams();
	const isAnchorFm = useIsAnchorFm();
	const currentUserExists = useSelect( ( select ) => !! select( USER_STORE ).getCurrentUser() );
	const [ isLoading, setIsLoading ] = useState( !! ( isAnchorFm && currentUserExists ) );

	useEffect( () => {
		// Must be a logged-in user on anchor FM to check
		if ( ! isAnchorFm || ! currentUserExists || anchorFmIsNewSite ) {
			setIsLoading( false );
			return;
		}

		setIsLoading( true );
		wpcom
			.undocumented()
			.getMatchingAnchorSite(
				anchorFmPodcastId,
				anchorFmEpisodeId,
				anchorFmSpotifyUrl,
				anchorFmSite,
				anchorFmPost
			)
			.then( ( result: AnchorEndpointResult ) => {
				if ( result?.location ) {
					try {
						page( result.location );
					} catch ( err ) {
						window.location.href = result.location;
					}
				} else {
					setIsLoading( false );
				}
			} )
			.catch( () => {
				setIsLoading( false );
			} );
	}, [
		isAnchorFm,
		currentUserExists,
		anchorFmPodcastId,
		anchorFmEpisodeId,
		anchorFmSpotifyUrl,
		anchorFmSite,
		anchorFmPost,
		anchorFmIsNewSite,
	] );
	return isLoading;
}
