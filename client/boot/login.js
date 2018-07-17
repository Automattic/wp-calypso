/** @format */
// Initialize polyfills before any dependencies are loaded
import './polyfills';

/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */

const debug = debugFactory( 'calypso' );

window.AppBoot = () => {
	debug( 'boot login page' );
};
