/**
 * External dependencies
 */

import debugFactory from 'debug';
import { throttle } from 'lodash';

const debug = debugFactory( 'calypso:infinite-list:scroll-store' );

const THROTTLE_INTERVAL_MS = 1000;
const THROTTLE_OPTIONS = { leading: false };

const scrollPositionsStore = new Map();
const scrollTopStore = new Map();

const ScrollStore = {
	getPositions( url ) {
		const positions = scrollPositionsStore.get( url );
		debug( 'getting positions:', url, positions );
		return positions;
	},

	storePositions: throttle(
		function ( url, positions ) {
			debug( 'storing positions:', url, positions );
			scrollPositionsStore.set( url, positions );
		},
		THROTTLE_INTERVAL_MS,
		THROTTLE_OPTIONS
	),

	getScrollTop( url ) {
		const scrollTop = scrollTopStore.get( url );
		debug( 'getting scrollTop:', url, scrollTop );
		return scrollTop;
	},

	storeScrollTop: throttle(
		function ( url, scrollTop ) {
			debug( 'storing scrollTop:', url, scrollTop );
			scrollTopStore.set( url, scrollTop );
		},
		THROTTLE_INTERVAL_MS,
		THROTTLE_OPTIONS
	),
};

export default ScrollStore;
