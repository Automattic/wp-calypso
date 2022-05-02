import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isAnchorPodcastIdValid } from 'calypso/landing/stepper/hooks/use-is-anchor-fm';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import usePodcastTitle from './use-podcast-title';

export default function useSiteTitle(): void {
	const { setSiteTitle } = useDispatch( ONBOARD_STORE );
	const podcastTitle = usePodcastTitle();
	const { siteTitle } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
	const hasSiteTitle = siteTitle.length > 0;

	// When first loading a url including an ?anchor_podcast query param, clear
	// the title.
	// This allows the title retrieved from from backend to be applied, since
	// we only apply it over blank titles to prevent wiping out custom titles
	// set by the user.
	// This also retains the ability to keep custom titles when reloading the
	// browser during steps
	const { search } = useLocation();
	useEffect( () => {
		const queryAnchorPodcast = new URLSearchParams( search ).get( 'anchor_podcast' );
		if ( isAnchorPodcastIdValid( queryAnchorPodcast ) ) {
			setSiteTitle( '' );
		}
	}, [] ); // Only run on initial mount

	useEffect( () => {
		if ( podcastTitle && ! hasSiteTitle ) {
			// Set initial site title to podcast title
			setSiteTitle( podcastTitle );
		}
	}, [ podcastTitle, setSiteTitle, hasSiteTitle ] );
}
