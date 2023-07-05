import { DeviceSwitcher } from '@automattic/components';
import { Spinner } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import classnames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import './style.scss';

interface Viewport {
	width: number;
	height: number;
}

interface ThemePreviewProps {
	url: string;
	inlineCss?: string;
	viewportWidth?: number;
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
	inlineCss,
	viewportWidth,
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
	const [ viewport, setViewport ] = useState< Viewport >();
	const [ containerResizeListener, { width: containerWidth } ] = useResizeObserver();
	const calypso_token = useMemo( () => uuid(), [] );
	const scale = containerWidth && viewportWidth ? containerWidth / viewportWidth : 1;

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
				default:
					return;
			}
		};

		window.addEventListener( 'message', handleMessage );

		return () => {
			window.removeEventListener( 'message', handleMessage );
		};
	}, [ setIsLoaded, setViewport ] );

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
	}, [ inlineCss, isLoaded, isFullyLoaded ] );

	return (
		<DeviceSwitcher
			className={ classnames( 'theme-preview__container', {
				'theme-preview__container--loading': ! isLoaded && ! isFullyLoaded,
			} ) }
			isShowDeviceSwitcherToolbar={ isShowDeviceSwitcher }
			isShowFrameBorder={ isShowFrameBorder }
			isFullscreen={ isFullscreen }
			onDeviceChange={ recordDeviceClick }
		>
			{ containerResizeListener }
			<div className="theme-preview__frame-wrapper">
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
					} }
					src={ addQueryArgs( url, { calypso_token } ) }
					scrolling={ isFitHeight ? 'no' : 'yes' }
					tabIndex={ -1 }
				/>
			</div>
		</DeviceSwitcher>
	);
};

export default ThemePreview;
