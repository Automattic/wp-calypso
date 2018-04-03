/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

export default PropTypes.shape( {
	id: PropTypes.number.isRequired,
	address: PropTypes.arrayOf( PropTypes.string ).isRequired,
	name: PropTypes.string.isRequired,
	photo: PropTypes.string,
	verified: PropTypes.bool.isRequired,
} );
