/**
 * @format
 */

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
	taxExempt = false,
	taxApplicable = false,
	taxIncluded = false,
	taxExcluded = false,
} ) {
	return (
		<React.Fragment>
			<div className="billing-history__transaction-amount">{ amount }</div>
			{ taxExempt || <div className="billing-history__transaction-amount-tax">{ tax }</div> }
		</React.Fragment>
	);
}

TransactionAmount.propTypes = {
	translate: PropTypes.func.isRequired,
	amount: PropTypes.string.isRequired,
	tax: PropTypes.string.isRequired,
	taxExempt: PropTypes.bool,
	taxApplicable: PropTypes.bool,
	taxIncluded: PropTypes.bool,
	taxExcluded: PropTypes.bool,
};

export default localize( TransactionAmount );
