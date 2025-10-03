import { SiteThumbnail, Spinner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React, { FC } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSitePreviewMShotImageHandler } from './hooks/use-site-preview-mshot-image-handler';
import './style.scss';

export const SitePreview: FC = () => {
	const translate = useTranslate();
	const fromUrl = useQuery().get( 'from' ) || '';

	const { mShotsOption, previewRef } = useSitePreviewMShotImageHandler( fromUrl );
	const label = translate( 'Preview of the site being imported' );

	return (
		<div className="migration-instructions-from-preview" ref={ previewRef }>
			<SiteThumbnail
				mShotsUrl={ fromUrl }
				className="migration-instructions-from-preview__screenshot"
				alt={ label }
				aria-label={ label }
				mshotsOption={ mShotsOption }
				width={ mShotsOption ? mShotsOption.w : undefined }
				height={ mShotsOption ? mShotsOption.h : undefined }
			>
				<Spinner className="site-screenshot__spinner" size={ 50 } />
			</SiteThumbnail>
		</div>
	);
};
