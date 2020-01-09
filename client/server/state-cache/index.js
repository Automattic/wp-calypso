/**
 * External dependencies
 */

import Lru from 'lru';

const HOUR_IN_MS = 3600000;
const stateCache = new Lru( {
	max: 500,
	maxAge: HOUR_IN_MS,
} );

export default stateCache;
