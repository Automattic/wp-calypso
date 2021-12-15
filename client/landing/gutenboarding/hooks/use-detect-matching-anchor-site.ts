import { useSelect } from '@wordpress/data';
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

		// construct query object from entries that are not null or undefined
		const query = Object.fromEntries(
			[
				[ 'podcast', anchorFmPodcastId ],
				[ 'episode', anchorFmEpisodeId ],
				[ 'spotify_url', anchorFmSpotifyUrl ],
				[ 'site', anchorFmSite ],
				[ 'post', anchorFmPost ],
			].filter( ( [ , value ] ) => value != null )
		);

		wpcom.req
			.get( { path: '/anchor', apiNamespace: 'wpcom/v2' }, query )
			.then( ( result: AnchorEndpointResult ) => {
				if ( result.location ) {
					window.location.href = result.location;
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
