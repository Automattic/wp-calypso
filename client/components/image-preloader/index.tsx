/**
 * External dependencies
 */
import React, { useState, useEffect, useRef } from 'react';
import { noop } from 'lodash';

/**
 * Constants
 */
enum LoadStatus {
	PENDING,
	LOADING,
	LOADED,
	FAILED,
}

type ImageEventHandler = ( event: string | Event ) => void;

interface Props {
	src?: string;
	placeholder: React.ReactNode;
	onLoad?: ImageEventHandler;
	onError?: ImageEventHandler;
}

type ImgProps = Omit< React.ComponentPropsWithoutRef< 'img' >, 'src' >;

export default function ImagePreloader( props: Props & ImgProps ) {
	const { children, src, placeholder, onLoad, onError, ...imageProps } = props;

	const [ status, setStatus ] = useState( LoadStatus.PENDING );
	const image = useRef< HTMLImageElement | null >( null );
	const latestOnLoad = useRef( onLoad );
	const latestOnError = useRef( onError );

	// Update callback refs when one of the callbacks changes.
	// We always want to use the latest version of these callbacks, rather than the ones
	// that were there when the image started loading. We don't want to trigger the image
	// loading again, though, so we save them as refs.
	useEffect( () => {
		latestOnLoad.current = onLoad;
		latestOnError.current = onError;
	}, [ onError, onLoad ] );

	// Load image at start and whenever the `src` prop changes.
	useEffect( () => {
		setStatus( LoadStatus.LOADING );

		if ( ! src ) {
			return;
		}

		function destroyLoader() {
			if ( ! image.current ) {
				return;
			}

			image.current.onload = noop;
			image.current.onerror = noop;
			image.current = null;
		}

		function onLoadComplete( event: string | Event ) {
			destroyLoader();

			if ( ! event || ( event as Event ).type !== 'load' ) {
				setStatus( LoadStatus.FAILED );
				if ( latestOnError.current ) {
					latestOnError.current( event );
				}
				return;
			}

			setStatus( LoadStatus.LOADED );
			if ( latestOnLoad.current ) {
				latestOnLoad.current( event );
			}
		}

		image.current = new Image();
		image.current.src = src;
		image.current.onload = onLoadComplete;
		image.current.onerror = onLoadComplete;

		return destroyLoader;
	}, [ src ] );

	let childrenToRender;

	switch ( status ) {
		case LoadStatus.LOADING:
			childrenToRender = placeholder;
			break;

		case LoadStatus.LOADED:
			// Assume image props always include alt text.
			// eslint-disable-next-line jsx-a11y/alt-text
			childrenToRender = <img src={ src } { ...imageProps } />;
			break;

		case LoadStatus.FAILED:
			childrenToRender = children;
			break;

		default:
			break;
	}

	return <div className="image-preloader">{ childrenToRender }</div>;
}
