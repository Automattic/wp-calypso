/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const SetupFooter = ( { label, onClick, primary } ) => {
	return (
		<div className="dashboard__setup-footer">
			<Button onClick={ onClick } primary={ primary }>{ label }</Button>
		</div>
	);
};

SetupFooter.propTypes = {
	label: PropTypes.string.isRequired,
	onClick: PropTypes.func.isRequired,
	primary: PropTypes.bool,
};

export default SetupFooter;
