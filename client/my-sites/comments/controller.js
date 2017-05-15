/**
 * External dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import React from 'react';

/**
 * Internal dependencies
 */
import CommentsManagement from './main';

export const comments = function( context ) {
	renderWithReduxStore(
		<CommentsManagement
			basePath={ context.path } />,
		'primary',
		context.store
	);
};
