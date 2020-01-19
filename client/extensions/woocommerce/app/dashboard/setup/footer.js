/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';

const SetupFooter = ( { busy, disabled, label, onClick, primary } ) => {
	return (
		<div className="setup__footer">
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

SetupFooter.defaultProps = {
	busy: false,
	disabled: false,
	primary: false,
};

export default SetupFooter;
