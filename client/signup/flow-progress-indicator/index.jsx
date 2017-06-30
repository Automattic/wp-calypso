/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

const FlowProgressIndicator = ( { flowLength, positionInFlow, translate } ) => {
	if ( flowLength > 1 ) {
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
