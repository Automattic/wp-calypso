/**
 * External dependencies
 */
import React, { forwardRef, useEffect, DetailedHTMLProps, IframeHTMLAttributes } from 'react';

type IframeProps = DetailedHTMLProps<
	IframeHTMLAttributes< HTMLIFrameElement >,
	HTMLIFrameElement
>;

const Iframe = forwardRef< HTMLIFrameElement, IframeProps >( function IFrame( props, ref ) {
	useEffect( () => {
		window.performance?.mark( 'iframe_rendered' );
	}, [ props.src ] );

	// eslint-disable-next-line jsx-a11y/iframe-has-title
	return <iframe { ...props } ref={ ref } />;
} );

export default Iframe;
