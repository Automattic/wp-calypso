/**
 * External dependencies
 */
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';

/**
 * Internal dependencies
 */
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import usePodcastTitle from './use-podcast-title';

export default function useSiteTitle(): void {
	const { setSiteTitle } = useDispatch( ONBOARD_STORE );
	const podcastTitle = usePodcastTitle();

	useEffect( () => {
		if ( podcastTitle && podcastTitle.length > 1 ) {
			// Set initial site title to podcast title
			setSiteTitle( podcastTitle );
		}
	}, [ podcastTitle, setSiteTitle ] );
}
