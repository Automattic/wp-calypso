import { SiteThumbnail, Spinner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React, { FC, useEffect, useRef, useState } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import './style.scss';

export const SitePreview: FC = () => {
	const translate = useTranslate();
	const fromUrl = useQuery().get( 'from' ) || '';

	const previewRef = useRef< HTMLDivElement >( null );
	const [ MShotsOptions, setMShotsOptions ] = useState( {
		vpw: 1600,
		vph: 1024,
		w: 1600,
		h: 1024,
		screen_height: 1024,
		segment: '',
	} );

	const getSegment = ( width: number ) => {
		switch ( true ) {
			case width >= 1024:
				return 'desktop';
			case width >= 768:
				return 'tablet';
			default:
				return 'mobile';
		}
	};

	const updateDimensions = () => {
		if ( previewRef.current ) {
			const { offsetWidth, offsetHeight } = previewRef.current;
			const width = Math.min( offsetWidth, 1920 );

			const currentSegment = getSegment( width );

			if ( currentSegment === MShotsOptions.segment ) {
				return;
			}

			setMShotsOptions( {
				vpw: width,
				vph: offsetHeight,
				w: width,
				h: offsetHeight,
				screen_height: offsetHeight,
				segment: getSegment( width ),
			} );
		}
	};

	useEffect( () => {
		updateDimensions();

		// Throttle the resize event handling.
		let resizeTimeout: ReturnType< typeof setTimeout >;
		const throttledResizeHandler = () => {
			clearTimeout( resizeTimeout );
			resizeTimeout = setTimeout( updateDimensions, 200 );
		};

		window.addEventListener( 'resize', throttledResizeHandler );
		return () => window.removeEventListener( 'resize', throttledResizeHandler );
	}, [ MShotsOptions.segment ] );

	return (
		<div className="migration-instructions-from-preview" ref={ previewRef }>
			<SiteThumbnail
				mShotsUrl={ fromUrl }
				className="migration-instructions-from-preview__screenshot"
				alt={ translate( 'Preview of the site being imported' ) }
				mshotsOption={ MShotsOptions }
				width={ MShotsOptions.w }
				height={ MShotsOptions.h }
			>
				<Spinner className="site-screenshot__spinner" size={ 50 } />
			</SiteThumbnail>
		</div>
	);
};
