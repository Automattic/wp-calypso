/**
 * External Dependencies
 *
 * @format
 */

import React from 'react';

/**
 * Internal Dependencies
 */

import { renderWithReduxStore } from 'lib/react-helpers';
import Show from '../show';

export function show( context ) {
	renderWithReduxStore(
		React.createElement( Show, {
			context,
		} ),
		'primary',
		context.store
	);
}
