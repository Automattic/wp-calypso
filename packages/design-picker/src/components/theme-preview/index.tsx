import { useResizeObserver } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import classnames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import './style.scss';

interface Viewport {
	width: number;
	height: number;
}

interface Props {
	url: string;
	viewportWidth: number;
}

const ThemePreview = ( { url, viewportWidth }: Props ) => {
	const { __ } = useI18n();
	const calypso_token = useMemo( () => uuid(), [] );
	const [ isLoaded, setIsLoaded ] = useState( false );
	const [ viewport, setViewport ] = useState< Viewport >();

	const [ containerResizeListener, { width: containerWidth } ] = useResizeObserver();

	const scale = containerWidth ? containerWidth / viewportWidth : 1;

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
					setViewport( data.payload );
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

	return (
		<div
			className={ classnames( 'theme-preview__container', {
				'theme-preview__container--loading': ! isLoaded,
			} ) }
		>
			{ containerResizeListener }
			<iframe
				title={ __( 'Preview', __i18n_text_domain__ ) }
				className="theme-preview__frame"
				style={ {
					width: viewportWidth,
					height: viewport?.height,
					transform: `scale(${ scale })`,
				} }
				src={ addQueryArgs( url, { calypso_token } ) }
				scrolling="no"
			/>
		</div>
	);
};

export default ThemePreview;
