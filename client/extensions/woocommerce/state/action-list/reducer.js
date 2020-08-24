/**
 * External dependencies
 */

import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import {
	WOOCOMMERCE_ACTION_LIST_ANNOTATE,
	WOOCOMMERCE_ACTION_LIST_CLEAR,
} from 'woocommerce/state/action-types';

export default withoutPersistence( ( state = null, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_ACTION_LIST_CLEAR:
			return handleActionListClear( state, action );
		case WOOCOMMERCE_ACTION_LIST_ANNOTATE:
			return handleActionListAnnotate( state, action );
	}

	return state;
} );

function handleActionListClear() {
	// Clear out the existing action list.
	return null;
}

function handleActionListAnnotate( actionlist, action ) {
	const { prevSteps, currentStep, nextSteps } = action.actionList;
	const pickNames = [ 'description', 'startTime', 'endTime' ];

	return {
		prevSteps: ( prevSteps || [] ).map( ( step ) => pick( step, pickNames ) ),
		currentStep: currentStep ? pick( currentStep, pickNames ) : null,
		nextSteps: nextSteps.map( ( step ) => pick( step, pickNames ) ),
	};
}
