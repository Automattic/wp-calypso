/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

function TransactionAmount( {
	translate,
	amount,
	tax,
	exempt = false,
	applicable = false,
	included = false,
	excluded = false,
} ) {
	return (
		<React.Fragment>
			<div class="">{ null }</div>
		</React.Fragment>
	);
}

TransactionAmount.propTypes = {
	translate: PropTypes.func.isRequired,
	amount: PropTypes.string.isRequired,
	tax: PropTypes.string.isRequired,
	exempt: PropTypes.bool,
	applicable: PropTypes.bool,
	included: PropTypes.bool,
	excluded: PropTypes.bool,
};

export default localize( TransactionAmount );
