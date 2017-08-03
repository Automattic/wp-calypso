/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

const ProgressIndicator = ( { stepNumber, totalSteps, translate } ) => {
	return (
		<div className="wizard__progress-indicator">
			{
				translate( 'Step %(stepNumber)d of %(stepTotal)d', {
					args: {
						stepNumber: stepNumber + 1,
						stepTotal: totalSteps,
					}
				} )
			}
		</div>
	);
};

ProgressIndicator.propTypes = {
	stepNumber: PropTypes.number.isRequired,
	totalSteps: PropTypes.number.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( ProgressIndicator );
