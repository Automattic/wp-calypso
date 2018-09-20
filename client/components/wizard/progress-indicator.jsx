/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

const ProgressIndicator = ( { stepNumber, totalSteps, translate } ) => (
	<div
		className="wizard__progress-indicator"
		data-e2e-type={ 'step-indicator-' + ( stepNumber + 1 ) }
	>
		{ translate( 'Step %(stepNumber)d of %(stepTotal)d', {
			args: {
				stepNumber: stepNumber + 1,
				stepTotal: totalSteps,
			},
		} ) }
	</div>
);

ProgressIndicator.propTypes = {
	stepNumber: PropTypes.number.isRequired,
	totalSteps: PropTypes.number.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( ProgressIndicator );
