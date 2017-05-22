/**
 * External dependencies
 */
// import ReactDom from 'react-dom';
import React from 'react';
// import page from 'page';

/**
 * Internal dependencies
 */

export default {
	preview: function( context, next ) {
		context.primary = <span>Preview Everywhere™!</span>;
		next();
	},
};
