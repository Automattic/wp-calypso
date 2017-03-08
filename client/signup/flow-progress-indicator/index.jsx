/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import flows from 'signup/config/flows';
import { localize } from 'i18n-calypso';

class FlowProgressIndicator extends Component {
	render() {
		const { flowName, positionInFlow, translate } = this.props,
			flow = flows.getFlow( flowName ),
			flowStepsLength = flow.steps.length,
			hideProgressIndicator = flow.hideProgressIndicator;

		if ( ! hideProgressIndicator && flowStepsLength > 1 ) {
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
		}

		return null;
	}
}

export default localize( FlowProgressIndicator );
