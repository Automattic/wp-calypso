/**
 * External dependencies
 */
import PropTypes from 'prop-types';

// Shape of context provided by the `makeTour` context provider.
// The same shape is expected by the context consumers, too.
export const contextTypes = Object.freeze( {
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
	dispatch: PropTypes.func.isRequired,
} );
