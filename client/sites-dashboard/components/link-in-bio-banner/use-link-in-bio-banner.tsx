import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';

const preference = `link-in-bio-banner`;

export const useLinkInBioBanner = () => {
	const dispatch = useDispatch();
	const isBannerVisible = useSelector( ( state ) => getPreference( state, preference ) );
	const showBanner = isBannerVisible === undefined || isBannerVisible;

	// TODO just for testing the PR - will be removed.
	useEffect( () => {
		const params = new URLSearchParams( window.location.search );
		if ( params.get( 'resetdismiss' ) ) {
			dispatch( savePreference( preference, true ) );
		}
	}, [] );

	const handleDismissBanner = () => {
		recordTracksEvent( 'calypso_link_in_bio_banner_dismiss_click' );
		dispatch( savePreference( preference, false ) );
	};

	const handleBannerViewed = () => {
		recordTracksEvent( 'calypso_link_in_bio_banner_viewed' );
	};

	const handleBannerCtaClick = () => {
		recordTracksEvent( 'calypso_link_in_bio_banner_cta_click' );
	};

	return { showBanner, handleBannerViewed, handleBannerCtaClick, handleDismissBanner };
};
