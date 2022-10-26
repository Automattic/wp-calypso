import { LinkInBioDoubleTileBanner } from './link-in-bio-double-tile-banner';
import { LinkInBioRowBanner } from './link-in-bio-row-banner';
import { LinkInBioTileBanner } from './link-in-bio-tile-banner';

export type BannerType = 'none' | 'tile' | 'double-tile' | 'row';

export const LinkInBioBanners: {
	[ key in BannerType ]: JSX.Element | null;
} = {
	none: null,
	tile: <LinkInBioTileBanner />,
	'double-tile': <LinkInBioDoubleTileBanner />,
	row: <LinkInBioRowBanner />,
};
