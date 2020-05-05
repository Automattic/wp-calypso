/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getPreference } from 'state/preferences/selectors';

const Label = ( { itemsCount, itemsPerRow, lastInRow, scale, text } ) => {
	const margin = ( ( 1 % scale ) / ( itemsPerRow - 1 ) ) * 100 || 0;
	const style = {
		marginRight: `${ lastInRow ? 0 : margin }%`,
		width: `${ scale * itemsCount * 100 + margin * ( itemsCount - 1 ) }%`,
	};

	return (
		<div className="sorted-grid__label" style={ style }>
			{ text }
		</div>
	);
};

Label.propTypes = {
	itemsCount: PropTypes.number,
	itemsPerRow: PropTypes.number,
	lastInRow: PropTypes.bool,
	scale: PropTypes.number.isRequired,
	text: PropTypes.string,
};

Label.defaultProps = {
	text: '',
};

const connectComponent = connect(
	( state ) => ( {
		scale: getPreference( state, 'mediaScale' ),
	} ),
	null,
	null,
	{ pure: false }
);

export default connectComponent( Label );
