/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { noop, snakeCase } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';
import { getCurrencyDefaults } from 'lib/format-currency';
import PriceInput from 'woocommerce/components/price-input';

class OrderTotalRow extends Component {
	static propTypes = {
		currency: PropTypes.string.isRequired,
		isEditable: PropTypes.bool,
		label: PropTypes.string.isRequired,
		name: PropTypes.string,
		numberFormat: PropTypes.func,
		onChange: PropTypes.func,
		showTax: PropTypes.bool,
		taxValue: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
		translate: PropTypes.func.isRequired,
		value: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ).isRequired,
	};

	static defaultProps = {
		currency: 'USD',
		isEditable: false,
		onChange: noop,
	};

	renderEditable = () => {
		const { className, currency, label, value, onChange, numberFormat } = this.props;
		let name = this.props.name;
		if ( ! name ) {
			name = snakeCase( label );
		}
		const { decimal, grouping, precision } = getCurrencyDefaults( currency );
		const total = numberFormat( Math.abs( value ), {
			decimals: precision,
			decPoint: decimal,
			thousandsSep: grouping,
		} );

		const classes = classnames( className, 'order-details__total order-details__total-edit' );
		return (
			<div className={ classes }>
				<div className="order-details__totals-label">{ label }</div>
				<div className="order-details__totals-value">
					<PriceInput name={ name } onChange={ onChange } currency={ currency } value={ total } />
				</div>
			</div>
		);
	};

	render() {
		if ( this.props.isEditable ) {
			return this.renderEditable();
		}
		const { className, currency, label, value, showTax, taxValue } = this.props;

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
}

export default localize( OrderTotalRow );
