/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal Dependencies
 */
import PaladinComponent from './main';

export default {
	activate: function( context, next ) {
		context.primary = React.createElement( PaladinComponent );
		next();
	},
};
