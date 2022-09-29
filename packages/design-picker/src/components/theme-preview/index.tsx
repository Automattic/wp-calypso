import { Spinner } from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import classnames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { DEVICE_TYPE } from '../../constants';
import Toolbar from './toolbar';
import type { Device } from '../../types';
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
	recordDeviceClick?: ( device: string ) => void;
}

const ThemePreview: React.FC< ThemePreviewProps > = ( {
	url,
	inlineCss,
	viewportWidth,
	isFitHeight,
	isShowFrameBorder,
	isShowDeviceSwitcher,
	recordDeviceClick,
} ) => {
	const { __ } = useI18n();
	const iframeRef = useRef< HTMLIFrameElement >( null );
	const [ isLoaded, setIsLoaded ] = useState( false );
	const [ viewport, setViewport ] = useState< Viewport >();
	const [ containerResizeListener, { width: containerWidth } ] = useResizeObserver();
	const calypso_token = useMemo( () => uuid(), [] );
	const scale = containerWidth && viewportWidth ? containerWidth / viewportWidth : 1;

	const [ device, setDevice ] = useState< Device >( DEVICE_TYPE.COMPUTER );
	function handleDeviceClick( device: string ) {
		recordDeviceClick?.( device );
		setDevice( device );
	}

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
				case 'page-dimensions-on-load':
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

	useEffect( () => {
		if ( isLoaded ) {
			iframeRef.current?.contentWindow?.postMessage(
				{
					channel: `preview-${ calypso_token }`,
					type: 'inline-css',
					inline_css: inlineCss,
				},
				'*'
			);
		}
	}, [ inlineCss, isLoaded ] );

	return (
		<div
			className={ classnames( 'theme-preview__container', {
				'theme-preview__container--loading': ! isLoaded,
				'theme-preview__container--frame-bordered': isShowFrameBorder,
				'theme-preview__container--is-computer': device === 'computer',
				'theme-preview__container--is-tablet': device === 'tablet',
				'theme-preview__container--is-phone': device === 'phone',
			} ) }
		>
			{ containerResizeListener }
			{ isShowDeviceSwitcher && <Toolbar device={ device } onDeviceClick={ handleDeviceClick } /> }
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
		</div>
	);
};

export default ThemePreview;
