import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
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
	const showBanner = ! isLoading && doesNotAlreadyHaveALinkInBioSite && siteCount < 3;

	let bannerType: BannerType = 'none';

	if ( showBanner ) {
		bannerType = displayMode === 'grid' ? 'tile' : 'row';
	}

	return LinkInBioBanners[ bannerType ];
};
