import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useSelector } from 'react-redux';
import { getPreference } from 'calypso/state/preferences/selectors';
import { LINK_IN_BIO_BANNER_PREFERENCE } from './link-in-bio-banner-parts';
import { LinkInBioBanners, BannerType } from './link-in-bio-banners';

type Props = {
	displayMode: 'row' | 'grid';
	siteCount: number;
};

export const LinkInBioBanner = ( props: Props ) => {
	const { displayMode, siteCount } = props;
	const isMobile = useMobileBreakpoint();
	const isBannerVisible = useSelector( ( state ) =>
		getPreference( state, LINK_IN_BIO_BANNER_PREFERENCE )
	);
	const showBanner = isBannerVisible === undefined || isBannerVisible;

	const renderBanner = () => {
		let bannerType: BannerType = 'none';
		if ( showBanner ) {
			if ( isMobile ) {
				bannerType = 'tile';
			} else if ( displayMode === 'row' ) {
				if ( siteCount === 1 ) {
					bannerType = 'row';
				}
			} else if ( siteCount === 1 ) {
				bannerType = 'double-tile';
			} else if ( siteCount === 2 ) {
				bannerType = 'tile';
			}
		}
		return LinkInBioBanners[ bannerType ];
	};

	return renderBanner();
};
