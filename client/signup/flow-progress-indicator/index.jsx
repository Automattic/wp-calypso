/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import flows from 'signup/config/flows';
import { localize } from 'i18n-calypso';

const FlowProgressIndicator = ( { flowName, positionInFlow, translate } ) => {
	const flow = flows.getFlow( flowName ),
		flowStepsLength = flow.steps.length,
		hideProgressIndicator = flow.hideProgressIndicator;

	if ( hideProgressIndicator || flowStepsLength < 2 ) {
		return null;
	}

	return (
		<div className="flow-progress-indicator">{
			translate( 'Step %(stepNumber)d of %(stepTotal)d', {
				args: {
					stepNumber: positionInFlow + 1,
					stepTotal: flowStepsLength
				}
			} )
		}</div>
	);
};

export default localize( FlowProgressIndicator );
