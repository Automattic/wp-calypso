/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const SetupFooter = ( { busy, disabled, label, onClick, primary } ) => {
	return (
		<div className="dashboard__setup-footer">
			<Button busy={ busy } disabled={ disabled } onClick={ onClick } primary={ primary }>
				{ label }
			</Button>
		</div>
	);
};

SetupFooter.propTypes = {
	busy: PropTypes.bool,
	disabled: PropTypes.bool,
	label: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired,
	primary: PropTypes.bool,
};

export default SetupFooter;
