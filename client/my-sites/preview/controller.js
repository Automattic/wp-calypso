/**
 * External dependencies
 *
 * @format
 */

import React from 'react';

/**
 * Internal dependencies
 */
import PreviewMain from './main';

const controller = {
	preview: function( context, next ) {
		context.primary = <PreviewMain site={ context.params.site } />;
		next();
	},
};

const { preview } = controller;
export { preview };
export default controller;
