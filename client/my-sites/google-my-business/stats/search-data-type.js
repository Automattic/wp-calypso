/**
 * External dependencies
 */
import PropTypes from 'prop-types';

export default PropTypes.shape( {
	name: PropTypes.string.isRequired,
	value: PropTypes.number.isRequired,
	description: PropTypes.string,
} );
