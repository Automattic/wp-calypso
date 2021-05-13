/**
 * External dependencies
 */
import PropTypes from 'prop-types';

export default PropTypes.shape( {
	description: PropTypes.string,
	name: PropTypes.string.isRequired,
	value: PropTypes.number.isRequired,
} );
