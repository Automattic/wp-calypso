import { useSelector } from 'react-redux';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { getPreference } from 'calypso/state/preferences/selectors';
import { LINK_IN_BIO_BANNER_PREFERENCE } from './link-in-bio-banner-parts';
import { BannerType, LinkInBioBanners } from './link-in-bio-banners';

type Props = {
	displayMode: 'row' | 'grid';
};

const hasLinkInBioSite = ( sites: SiteExcerptData[] ) => {
	return Boolean(
		sites.find( ( site ) => {
			const option = site.options || {};
			return option.site_intent === 'link-in-bio';
		} )
	);
};

export const LinkInBioBanner = ( props: Props ) => {
	const { displayMode } = props;
	const { data: sites = [], isLoading } = useSiteExcerptsQuery();
	const siteCount = sites.length;
	const doesNotAlreadyHaveALinkInBioSite = ! hasLinkInBioSite( sites );
	const isBannerVisible = useSelector( ( state ) =>
		getPreference( state, LINK_IN_BIO_BANNER_PREFERENCE )
	);
	const showBanner =
		! isLoading &&
		doesNotAlreadyHaveALinkInBioSite &&
		( isBannerVisible == null || isBannerVisible ) &&
		siteCount < 3;

	let bannerType: BannerType = 'none';

	if ( showBanner ) {
		bannerType = displayMode === 'grid' ? 'tile' : 'row';
	}

	return LinkInBioBanners[ bannerType ];
};
