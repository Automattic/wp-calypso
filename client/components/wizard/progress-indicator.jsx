/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

const ProgressIndicator = ( { stepNumber, totalSteps, translate } ) => (
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

ProgressIndicator.propTypes = {
	stepNumber: PropTypes.number.isRequired,
	totalSteps: PropTypes.number.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( ProgressIndicator );
