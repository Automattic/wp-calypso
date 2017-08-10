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

const SetupFooter = ( { disabled, label, onClick, primary } ) => {
	return (
		<div className="dashboard__setup-footer">
			<Button disabled={ disabled } onClick={ onClick } primary={ primary }>
				{ label }
			</Button>
		</div>
	);
};

SetupFooter.propTypes = {
	disabled: PropTypes.bool,
	label: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired,
	primary: PropTypes.bool,
};

export default SetupFooter;
