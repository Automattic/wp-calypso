import { SiteThumbnail, getSiteLaunchStatus, Spinner } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { ComponentProps } from 'react';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

import './style.scss';

interface SiteScreenshotProps extends ComponentProps< typeof SiteThumbnail > {
	site: SiteExcerptData;
}

/**
 * Create a site screenshot using mShots.
 *
 * @returns SiteThumbnail
 */
export const SiteScreenshot = ( { site, ...props }: SiteScreenshotProps ) => {
	const shouldUseScreenshot = getSiteLaunchStatus( site ) === 'public';

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

	const siteName = site.name ? site.name : '';

	return (
		<SiteThumbnail
			{ ...props }
			mShotsUrl={ shouldUseScreenshot ? siteUrl : undefined }
			className={ `site-screenshot` }
			alt={ siteName }
			bgColorImgUrl={ site.icon?.img }
			mshotsOption={ MShotsOptions }
		>
			<Spinner className="site-screenshot__spinner" size={ 50 } />
		</SiteThumbnail>
	);
};
