import { SiteThumbnail, Spinner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC, useEffect } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { createSitePreviewScreenshot, SITE_PREVIEW_MSHOT } from './mshot';
import './style.scss';

export const SitePreview: FC< { url?: string; label?: string } > = ( { url, label } ) => {
	const translate = useTranslate();
	const fromUrl = useQuery().get( 'from' ) || '';
	const previewUrl = url ?? fromUrl;
	const previewLabel = label ?? translate( 'Preview of the site being imported' );

	useEffect( () => {
		if ( previewUrl ) {
			createSitePreviewScreenshot( previewUrl );
		}
	}, [ previewUrl ] );

	return (
		<div className="site-migration-preview">
			<SiteThumbnail
				mShotsUrl={ previewUrl }
				className="site-migration-preview__screenshot"
				alt={ previewLabel }
				aria-label={ previewLabel }
				mshotsOption={ SITE_PREVIEW_MSHOT }
				width={ SITE_PREVIEW_MSHOT.w }
				height={ SITE_PREVIEW_MSHOT.h }
			>
				<Spinner className="site-screenshot__spinner" size={ 50 } />
			</SiteThumbnail>
		</div>
	);
};
