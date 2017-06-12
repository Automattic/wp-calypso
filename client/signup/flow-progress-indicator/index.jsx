/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { abtest } from 'lib/abtest';
import flows from 'signup/config/flows';
import WizardBar from 'components/wizard-bar';

const FlowProgressIndicator = ( { flowName, positionInFlow, translate } ) => {
	const flow = flows.getFlow( flowName );
	const flowLength = flow.steps.length;

	if ( flowLength > 1 ) {
		if ( abtest( 'signupProgressIndicator' ) === 'wizardbar' ) {
			return (
				<div className="flow-progress-indicator">
					<div className="flow-progress-indicator__wizard-bar">
						<WizardBar value={ positionInFlow + 1 } total={ flowLength } />
					</div>
				</div>
			);
		}

		return (
			<div className="flow-progress-indicator">
				{
					translate( 'Step %(stepNumber)d of %(stepTotal)d', {
						args: {
							stepNumber: positionInFlow + 1,
							stepTotal: flowLength
						}
					} )
				}
			</div>
		);
	}

	return null;
};

export default localize( FlowProgressIndicator );
