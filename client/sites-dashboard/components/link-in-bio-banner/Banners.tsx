import { BannerType } from './BannerType';
import { LinkInBioDoubleTileBanner } from './link-in-bio-double-tile-banner';
import { LinkInBioRowBanner } from './link-in-bio-row-banner';
import { LinkInBioTileBanner } from './link-in-bio-tile-banner';

export const Banners = {
	[ BannerType.None ]: null,
	[ BannerType.Tile ]: <LinkInBioTileBanner />,
	[ BannerType.DoubleTile ]: <LinkInBioDoubleTileBanner />,
	[ BannerType.Row ]: <LinkInBioRowBanner />,
};
