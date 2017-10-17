/**
 * External dependencies
 *
 * @format
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';

const concierge = context => {
	const ConciergeRootComponent = <div />;

	renderWithReduxStore(
		React.createElement( ConciergeRootComponent, {} ),
		document.getElementById( 'primary' ),
		context.store
	);
};

export default {
	concierge,
};
