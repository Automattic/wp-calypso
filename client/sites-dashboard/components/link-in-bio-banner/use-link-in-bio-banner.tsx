import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { Banners } from 'calypso/sites-dashboard/components/link-in-bio-banner/Banners';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference } from 'calypso/state/preferences/selectors';
import { BannerType } from './BannerType';

const preference = `link-in-bio-banner`;

export const useLinkInBioBanner = () => {
	const dispatch = useDispatch();
	const isMobile = useMobileBreakpoint();
	const isBannerVisible = useSelector( ( state ) => getPreference( state, preference ) );
	const showBanner = isBannerVisible === undefined || isBannerVisible;

	const getBanner = ( sites: SiteExcerptData[], displayMode: 'row' | 'grid' ) => {
		let bannerType = BannerType.None;
		if ( showBanner ) {
			if ( isMobile ) {
				bannerType = BannerType.Tile;
			} else if ( displayMode === 'row' && sites.length === 1 ) {
				bannerType = BannerType.Row;
			} else if ( sites.length === 1 ) {
				bannerType = BannerType.DoubleTile;
			} else if ( sites.length === 2 ) {
				bannerType = BannerType.Tile;
			}
		}
		return Banners[ bannerType ];
	};

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

	return { getBanner, handleBannerViewed, handleBannerCtaClick, handleDismissBanner };
};
