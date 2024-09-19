import { SiteThumbnail, Spinner } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { ComponentProps } from 'react';
import type { SiteExcerptData } from '@automattic/sites';

import './style.scss';

interface SiteScreenshotProps extends ComponentProps< typeof SiteThumbnail > {
	site: SiteExcerptData;
	alt: string;
}

/**
 * Create a site screenshot using mShots.
 * @returns SiteThumbnail
 */
export const SiteScreenshot = ( { site, alt, ...props }: SiteScreenshotProps ) => {
	const shouldUseScreenshot =
		! site.is_coming_soon && ! site.is_private && site.launch_status === 'launched';

	let siteUrl = site.URL;
	if ( site.options?.updated_at ) {
		const updatedAt = new Date( site.options.updated_at );
		updatedAt.setMinutes( 0 );
		updatedAt.setSeconds( 0 );
		siteUrl = addQueryArgs( siteUrl, {
			v: updatedAt.getTime() / 1000,

			// This combination of flags stops free site headers and cookie banners from appearing.
			iframe: true,
			preview: true,
			hide_banners: true,
		} );
	}

	// mShots screenshot options.
	const MShotsOptions = {
		vpw: 1602,
		vph: 2120,
		w: 365,
		screen_height: 2120,
	};

	return (
		<SiteThumbnail
			{ ...props }
			mShotsUrl={ shouldUseScreenshot ? siteUrl : undefined }
			className="site-screenshot"
			alt={ alt }
			bgColorImgUrl={ site.icon?.img }
			mshotsOption={ MShotsOptions }
			width={ 365 }
			height={ 483 }
		>
			<Spinner className="site-screenshot__spinner" size={ 50 } />
		</SiteThumbnail>
	);
};
