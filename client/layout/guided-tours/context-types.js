/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';

// Shape of context provided by the `makeTour` context provider
export const childContextTypes = Object.freeze( {
	branching: PropTypes.object.isRequired,
	next: PropTypes.func.isRequired,
	quit: PropTypes.func.isRequired,
	start: PropTypes.func.isRequired,
	isValid: PropTypes.func.isRequired,
	isLastStep: PropTypes.bool.isRequired,
	tour: PropTypes.string.isRequired,
	tourVersion: PropTypes.string.isRequired,
	sectionName: PropTypes.string.isRequired,
	shouldPause: PropTypes.bool.isRequired,
	step: PropTypes.string.isRequired,
	lastAction: PropTypes.object,
} );

// Shape of context expected by the consumers: in addition to the context from the
// `makeTour` context provider, they expect also `store` from Redux.
export const contextTypes = Object.freeze( {
	...childContextTypes,
	store: PropTypes.object.isRequired,
} );
