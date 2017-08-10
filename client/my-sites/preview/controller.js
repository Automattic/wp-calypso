/** @format */
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PreviewMain from './main';

export default {
	preview: function( context, next ) {
		context.primary = <PreviewMain site={ context.params.site } />;
		next();
	},
};
