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
	const { siteTitle } = useSelect( ( select ) => ( {
		siteTitle: select( ONBOARD_STORE ).getSelectedSiteTitle(),
	} ) );

	useEffect( () => {
		if ( podcastTitle && ! siteTitle ) {
			// Set initial site title to podcast title
			setSiteTitle( podcastTitle );
		}
	}, [ podcastTitle, setSiteTitle, siteTitle ] );
}
