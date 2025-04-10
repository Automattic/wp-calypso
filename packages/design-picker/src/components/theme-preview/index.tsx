import { DeviceSwitcher } from '@automattic/components';
import { Spinner } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useEffect, useMemo, useRef, useState } from 'react';

import './style.scss';

interface Viewport {
	width: number;
	height: number;
}

interface ThemePreviewProps {
	url: string;
	siteInfo?: {
		title: string;
		tagline: string;
	};
	inlineCss?: string;
	viewportWidth?: number;
	iframeScaleRatio?: number;
	iframeToken?: string;
	isFitHeight?: boolean;
	isShowFrameBorder?: boolean;
	isShowDeviceSwitcher?: boolean;
	isFullscreen?: boolean;
	recordDeviceClick?: ( device: string ) => void;
}

// Determine whether the preview URL is from the WPCOM site preview endpoint.
// This endpoint allows more preview capabilities via window.postMessage().
const isUrlWpcomApi = ( url: string ) =>
	url.indexOf( 'public-api.wordpress.com/wpcom/v2/block-previews/site' ) >= 0;

const ThemePreview: React.FC< ThemePreviewProps > = ( {
	url,
	siteInfo,
	inlineCss,
	viewportWidth,
	iframeScaleRatio = 1,
	iframeToken,
	isFitHeight,
	isShowFrameBorder,
	isShowDeviceSwitcher,
	isFullscreen,
	recordDeviceClick,
} ) => {
	const { __ } = useI18n();
	const iframeRef = useRef< HTMLIFrameElement >( null );
	const [ isLoaded, setIsLoaded ] = useState( ! isUrlWpcomApi( url ) );
	const [ isFullyLoaded, setIsFullyLoaded ] = useState( ! isUrlWpcomApi( url ) );
	const [ frameLocation, setFrameLocation ] = useState( '' );
	const [ viewport, setViewport ] = useState< Viewport >();
	const [ containerResizeListener, { width: containerWidth } ] = useResizeObserver();
	const calypso_token = useMemo( () => iframeToken || crypto.randomUUID(), [ iframeToken ] );
	const scale = containerWidth && viewportWidth ? containerWidth / viewportWidth : iframeScaleRatio;
	const { title, tagline } = siteInfo || {};

	const wrapperHeight = useMemo( () => {
		if ( ! viewport || iframeScaleRatio === 1 ) {
			return 0;
		}

		return viewport.height * iframeScaleRatio;
	}, [ viewport?.height, iframeScaleRatio ] );

	useEffect( () => {
		const handleMessage = ( event: MessageEvent ) => {
			let data;
			try {
				data = JSON.parse( event.data );
			} catch ( err ) {
				return;
			}

			if ( ! data || data.channel !== 'preview-' + calypso_token ) {
				return;
			}

			switch ( data.type ) {
				case 'partially-loaded':
					setIsLoaded( true );
					return;
				case 'page-dimensions-on-load':
					setIsFullyLoaded( true );
				case 'page-dimensions-on-resize':
					if ( isFitHeight ) {
						setViewport( data.payload );
					}
					return;
				case 'location-change':
					// We need to make sure location changes so it triggers the post message effects.
					if ( data.payload.pathname === frameLocation ) {
						setFrameLocation( '' );
						return;
					}
					setFrameLocation( data.payload.pathname );
					return;
				default:
					return;
			}
		};

		window.addEventListener( 'message', handleMessage );

		return () => {
			window.removeEventListener( 'message', handleMessage );
		};
	}, [ calypso_token, isFitHeight, setIsLoaded, setViewport, frameLocation ] );

	// Ideally the iframe's document.body is already available on isLoaded = true.
	// Unfortunately that's not always the case, so isFullyLoaded serves as another retry.
	useEffect( () => {
		if ( isLoaded || isFullyLoaded ) {
			iframeRef.current?.contentWindow?.postMessage(
				{
					channel: `preview-${ calypso_token }`,
					type: 'inline-css',
					inline_css: inlineCss,
				},
				'*'
			);
		}
	}, [ inlineCss, isLoaded, isFullyLoaded, frameLocation, calypso_token ] );

	// Send site info to the iframe.
	useEffect( () => {
		// We only want to send info if it exists.
		if ( ! title && ! tagline ) {
			return;
		}
		if ( isLoaded || isFullyLoaded ) {
			iframeRef.current?.contentWindow?.postMessage(
				{
					channel: `preview-${ calypso_token }`,
					type: 'site-info',
					site_info: { title, tagline },
				},
				'*'
			);
		}
	}, [ title, tagline, calypso_token, isLoaded, isFullyLoaded, frameLocation ] );

	return (
		<DeviceSwitcher
			className={ clsx( 'theme-preview__container', {
				'theme-preview__container--loading': ! isLoaded && ! isFullyLoaded,
			} ) }
			isShowDeviceSwitcherToolbar={ isShowDeviceSwitcher }
			isShowFrameBorder={ isShowFrameBorder }
			isFullscreen={ isFullscreen }
			onDeviceChange={ recordDeviceClick }
		>
			{ containerResizeListener }
			<div
				className="theme-preview__frame-wrapper"
				style={ {
					...( wrapperHeight > 0 && { height: wrapperHeight } ),
				} }
			>
				{ ! isLoaded && (
					<div className="theme-preview__frame-message">
						<Spinner />
					</div>
				) }
				<iframe
					ref={ iframeRef }
					title={ __( 'Preview', __i18n_text_domain__ ) }
					className="theme-preview__frame"
					style={ {
						width: viewportWidth,
						height: viewport?.height,
						transform: `scale(${ scale })`,
						pointerEvents: 'all',
					} }
					src={ addQueryArgs( url, { calypso_token } ) }
					tabIndex={ -1 }
				/>
			</div>
		</DeviceSwitcher>
	);
};

export default ThemePreview;
