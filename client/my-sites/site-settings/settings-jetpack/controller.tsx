/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import JetpackMain from 'calypso/my-sites/site-settings/settings-jetpack/main';

export const jetpack: PageJS.Callback = ( context, next ) => {
	const { host, action } = context.query;

	context.primary = <JetpackMain action={ action } host={ host } />;

	next();
};
