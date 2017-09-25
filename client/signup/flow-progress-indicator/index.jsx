/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import React from 'react';

const FlowProgressIndicator = ( { flowLength, positionInFlow, translate, flowName } ) => {
	if ( flowLength > 1 ) {
		const flowClassName = classNames(
			'flow-progress-indicator',
			`flow-progress-indicator__${ flowName }`
		);

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
