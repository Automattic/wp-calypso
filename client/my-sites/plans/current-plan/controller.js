/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import CurrentPlanOverview from './main';

export default function( context ) {
	renderWithReduxStore(
		React.createElement( CurrentPlanOverview, {
			context: context
		} ),
		document.getElementById( 'primary' ),
		context.store
	);
}
