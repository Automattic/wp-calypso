/**
 * External dependencies
 */
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import usePodcastTitle from './use-podcast-title';

export default function useSiteTitle(): void {
	const { setSiteTitle } = useDispatch( ONBOARD_STORE );
	const podcastTitle = usePodcastTitle();
	const { hasSiteTitle } = useSelect( ( select ) => ( {
		hasSiteTitle: select( ONBOARD_STORE ).getSelectedSiteTitle().length > 0,
	} ) );

	useEffect( () => {
		if ( podcastTitle && ! hasSiteTitle ) {
			// Set initial site title to podcast title
			setSiteTitle( podcastTitle );
		}
	}, [ podcastTitle, setSiteTitle, hasSiteTitle ] );
}
