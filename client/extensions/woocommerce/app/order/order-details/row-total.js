/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';

function OrderTotalRow( {
	className,
	currency = 'USD',
	label,
	value,
	showTax,
	taxValue,
	translate,
} ) {
	if ( ! label ) {
		label = translate( 'Total' );
	}
	const tax = (
		<div className="order-details__totals-tax">{ formatCurrency( taxValue, currency ) }</div>
	);
	const classes = classnames( className, 'order-details__total' );

	return (
		<div className={ classes }>
			<div className="order-details__totals-label">{ label }</div>
			{ showTax && tax }
			<div className="order-details__totals-value">{ formatCurrency( value, currency ) }</div>
		</div>
	);
}

OrderTotalRow.propTypes = {
	currency: PropTypes.string.isRequired,
	label: PropTypes.string.isRequired,
	showTax: PropTypes.bool,
	taxValue: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
	translate: PropTypes.func.isRequired,
	value: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ).isRequired,
};

export default localize( OrderTotalRow );
