/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import SecurityMain from 'calypso/my-sites/site-settings/settings-security/main';

export function security( context, next ) {
	context.primary = React.createElement( SecurityMain );
	next();
}
