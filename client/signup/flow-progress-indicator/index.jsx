/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import flows from 'signup/config/flows';
import WizardBar from 'components/wizard-bar';

export default ( { flowName, positionInFlow } ) => {
	const flow = flows.getFlow( flowName );
	const flowLength = flow.steps.length;

	if ( flowLength > 1 ) {
		return (
			<div className="flow-progress-indicator">
				<div className="flow-progress-indicator__wizard-bar">
					<WizardBar value={ positionInFlow + 1 } total={ flowLength } isPulsing />
				</div>
			</div>
		);
	}

	return null;
};
