/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import flows from 'signup/config/flows';
import ProgressBar from 'components/progress-bar';

export default localize( ( { flowName, positionInFlow, translate } ) => {
	const flow = flows.getFlow( flowName );
	const flowLength = flow.steps.length;

	if ( flowLength > 1 ) {
		return (
			<div className="flow-progress-indicator__container">
				<div className="flow-progress-indicator__progress-bar">
					{ translate( 'Current progress:' ) }
					<ProgressBar value={ positionInFlow } total={ flowLength } isPulsing />
				</div>
			</div>
		);
	}

	return null;
} );
