/**
 * External dependencies
 */
import React from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * withIsAnchorFmSignup is a higher-order component that adds connected user mention support to whatever input it wraps.
 *
 * example: withIsAnchorFmSignup( Component )
 *
 * @param {object} WrappedComponent - React component to wrap
 * @returns {object} the enhanced component
 */
export const withIsAnchorFmSignup = createHigherOrderComponent( ( WrappedComponent ) => {
	return function WithIsAnchorFmSignup( props ) {
		// better to use useIsAnchor() hook here
		const url = new URL( window.location.href );
		const decodedUrl = decodeURIComponent( url.search );
		const searchParams = new URLSearchParams( decodedUrl );
		const anchorFmPodcastId = searchParams.get( 'anchor_podcast' );
		const isAnchorFmSignup = Boolean(
			anchorFmPodcastId && anchorFmPodcastId.match( /^[0-9a-f]{7,8}$/i )
		);
		return <WrappedComponent isAnchorFmSignup={ isAnchorFmSignup } { ...props } />;
	};
}, 'WithIsAnchorFmSignup' );
