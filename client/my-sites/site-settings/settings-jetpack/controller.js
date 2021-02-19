/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import JetpackMain from 'calypso/my-sites/site-settings/settings-jetpack/main';

export function jetpack( context, next ) {
	context.primary = React.createElement( JetpackMain );
	next();
}
