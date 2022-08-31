import { SiteThumbnail, getSiteLaunchStatus, Spinner } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import { ComponentProps } from 'react';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface DialogSiteThumbnailProps extends ComponentProps< typeof SiteThumbnail > {
	site: SiteExcerptData;
}

export const DialogSiteThumbnail = ( { site, ...props }: DialogSiteThumbnailProps ) => {
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

	return (
		<SiteThumbnail
			{ ...props }
			mShotsUrl={ shouldUseScreenshot ? siteUrl : undefined }
			alt={ site.name }
			bgColorImgUrl={ site.icon?.img }
		>
			<Spinner className="edit-gravatar__spinner" />
		</SiteThumbnail>
	);
};
