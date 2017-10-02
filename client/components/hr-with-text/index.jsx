/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

const HrWithText = ( { children } ) => (
	<div className="hr-with-text">
		<div>
			{ children }
		</div>
	</div>
);

HrWithText.propTypes = {
	children: PropTypes.node,
};

export default HrWithText;
