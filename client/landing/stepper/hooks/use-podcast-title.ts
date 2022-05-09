import apiFetch from '@wordpress/api-fetch';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { ONBOARD_STORE } from '../stores';
import { useAnchorFmParams } from './use-anchor-fm-params';

export default function usePodcastTitle(): string | null {
	const { siteTitle } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
	const { setSiteTitle } = useDispatch( ONBOARD_STORE );
	const { anchorFmPodcastId } = useAnchorFmParams();
	interface PodcastDetails {
		title?: string;
	}

	useEffect( () => {
		if ( ! anchorFmPodcastId ) {
			return;
		}
		// Fetch podcast title from /podcast-details endpoint
		apiFetch< PodcastDetails >( {
			path: `https://public-api.wordpress.com/wpcom/v2/podcast-details?url=https://anchor.fm/s/${ encodeURIComponent(
				anchorFmPodcastId
			) }/podcast/rss&_fields=title`,
		} )
			.then( ( response ) => {
				if ( response?.title ) {
					setSiteTitle( response.title );
				}
			} )
			.catch( () => {
				setSiteTitle( '' );
			} );
	}, [ anchorFmPodcastId ] );
	return siteTitle;
}
