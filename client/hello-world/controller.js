/**
 * External dependencies
 *
 * @format
 */

import HelloWorldPrimary from 'hello-world/main-primary';
import HelloWorldSecondary from 'hello-world/main-secondary';

/**
 * External dependencies
 */
import React from 'react';

export default {
	helloDemo( context, next ) {
		// Shouldn't this change the cache key? As explained here:
		// https://github.com/Automattic/wp-calypso/blob/master/docs/server-side-rendering.md#render-cache
		// context.cacheQueryKey = 'hello-test';
		//
		// Edit: nope, it seems to be `cacheQueryKeys` and it requires also `query`
		// See: https://github.com/Automattic/wp-calypso/blob/master/server/isomorphic-routing/index.js#L99-L101
		//
		// calypso:server-render cache access for key +27s /hello-world

		context.primary = <HelloWorldPrimary />;

		// This could be set to `null` as well
		context.secondary = <HelloWorldSecondary />;

		next();
	},
};
