/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import DiscussionMain from 'client/my-sites/site-settings/settings-discussion/main';

export default {
	discussion( context, next ) {
		context.primary = React.createElement( DiscussionMain );
		next();
	},
};
