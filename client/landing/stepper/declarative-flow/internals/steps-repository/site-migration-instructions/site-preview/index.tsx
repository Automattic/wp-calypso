import { SiteThumbnail, Spinner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FC, useEffect, useRef } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSitePreviewMShotImageHandler } from './hooks/use-site-preview-mshot-image-handler';
import './style.scss';

export const SitePreview: FC = () => {
	const translate = useTranslate();
	const fromUrl = useQuery().get( 'from' ) || '';

	const previewRef = useRef< HTMLDivElement >( null );
	const { mShotsOption, updateDimensions } = useSitePreviewMShotImageHandler();

	useEffect( () => {
		updateDimensions( previewRef );

		// Throttle the resize event handling.
		let resizeTimeout: ReturnType< typeof setTimeout >;
		const throttledResizeHandler = () => {
			clearTimeout( resizeTimeout );
			resizeTimeout = setTimeout( () => updateDimensions( previewRef ), 200 );
		};

		window.addEventListener( 'resize', throttledResizeHandler );
		return () => window.removeEventListener( 'resize', throttledResizeHandler );
	}, [] );

	return (
		<div className="migration-instructions-from-preview" ref={ previewRef }>
			<SiteThumbnail
				mShotsUrl={ fromUrl }
				className="migration-instructions-from-preview__screenshot"
				alt={ translate( 'Preview of the site being imported' ) }
				mshotsOption={ mShotsOption }
				width={ mShotsOption ? mShotsOption.w : undefined }
				height={ mShotsOption ? mShotsOption.h : undefined }
			>
				<Spinner className="site-screenshot__spinner" size={ 50 } />
			</SiteThumbnail>
		</div>
	);
};
