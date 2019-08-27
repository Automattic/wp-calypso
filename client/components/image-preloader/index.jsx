/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import { noop } from 'lodash';

/**
 * Constants
 */
const LoadStatus = {
	PENDING: 'PENDING',
	LOADING: 'LOADING',
	LOADED: 'LOADED',
	FAILED: 'FAILED',
};

export default function ImagePreloader( props ) {
	const { children, src, placeholder, onLoad, onError, ...imageProps } = props;

	const [ status, setStatus ] = useState( LoadStatus.PENDING );
	const image = useRef( null );
	const latestOnLoad = useRef( onLoad );
	const latestOnError = useRef( onError );

	// Update callback refs when one of the callbacks changes.
	// We always want to use the latest version of these callbacks, rather than the ones
	// that were there when the image started loading.
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

		function onLoadComplete( event ) {
			destroyLoader();

			if ( ! event || event.type !== 'load' ) {
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

ImagePreloader.propTypes = {
	src: PropTypes.string,
	placeholder: PropTypes.element.isRequired,
	onLoad: PropTypes.func,
	onError: PropTypes.func,
};
