import { LinkInBioRowBanner } from './link-in-bio-row-banner';
import { LinkInBioTileBanner } from './link-in-bio-tile-banner';

export type BannerType = 'none' | 'tile' | 'row';

export const LinkInBioBanners: {
	[ key in BannerType ]: JSX.Element | null;
} = {
	none: null,
	tile: <LinkInBioTileBanner />,
	row: <LinkInBioRowBanner />,
};
