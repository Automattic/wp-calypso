/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';
import page from 'page';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { requestAnchorMatchingSite } from 'calypso/state/data-getters';
import { waitForHttpData } from 'calypso/state/data-layer/http-data';
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
	const [ isLoading, setIsLoading ] = React.useState( !! ( isAnchorFm && currentUserExists ) );

	React.useEffect( () => {
		// Must be a logged-in user on anchor FM to check
		if ( ! isAnchorFm || ! currentUserExists || anchorFmIsNewSite ) {
			setIsLoading( false );
			return;
		}

		// Fails with error
		// Error: Cannot use HTTP data without injecting Redux store enhancer!
		// Changing <AcquireIntent> (where this hook is used) to "export default connect( null, null )( AcquireIntent );" (connect from react-redux)
		// Causes a new error about <Provider>/store missing (Not used in gutenboarding?)
		console.log( 'new method of making fetch:' );
		waitForHttpData( () => ( {
			match: requestAnchorMatchingSite(
				anchorFmPodcastId,
				anchorFmEpisodeId,
				anchorFmSpotifyUrl,
				anchorFmSite,
				anchorFmPost
			),
		} ) ).then( ( result ) => {
			console.log( 'fetch done: ' );
			console.log( { result } );
		} );

		// Does this return a promise? - Doesn't work
		// Error: Cannot use HTTP data without injecting Redux store enhancer!
		/*
		const a = requestAnchorMatchingSite(
			anchorFmPodcastId,
			anchorFmEpisodeId,
			anchorFmSpotifyUrl,
			anchorFmSite,
			anchorFmPost
		);
		console.log( { a } );
		*/

		// Use wpcom.undocumented() (Works)
		/*
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
			*/
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
