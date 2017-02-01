/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { renderPage } from 'lib/react-helpers';
import PaladinComponent from './main';

module.exports = {
	activate: function( context ) {
		renderPage(
			React.createElement( PaladinComponent ),
			context
		);
	}
};

