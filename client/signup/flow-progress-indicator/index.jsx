/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

const FlowProgressIndicator = ( { flowLength, positionInFlow, translate, flowName } ) => {
	if ( flowLength > 1 ) {

		let flowClassName = `flow-progress-indicator flow-progress-indicator--${ flowName }`;

		return (
			<div className={ flowClassName }>
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
