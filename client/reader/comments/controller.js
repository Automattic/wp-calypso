/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Comments from './comments';
import { renderWithReduxStore } from 'lib/react-helpers';

export default {
	list( context ) {
		const { q: query } = context.query;

		renderWithReduxStore(
			<Comments query={ query || '' } />,
			document.getElementById( 'primary' ),
			context.store
		);
	}
};
