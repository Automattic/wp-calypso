/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { noop, snakeCase } from 'lodash';
import { localize } from 'i18n-calypso';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import PriceInput from 'woocommerce/components/price-input';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

class OrderTotalRow extends Component {
	static propTypes = {
		currency: PropTypes.string.isRequired,
		isEditable: PropTypes.bool,
		label: PropTypes.string.isRequired,
		name: PropTypes.string,
		onBlur: PropTypes.func,
		onChange: PropTypes.func,
		showTax: PropTypes.bool,
		taxValue: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
		translate: PropTypes.func.isRequired,
		value: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ).isRequired,
	};

	static defaultProps = {
		currency: 'USD',
		isEditable: false,
		onBlur: noop,
		onChange: noop,
	};

	renderEditable = () => {
		const { className, currency, initialValue, label, onBlur, onChange, value } = this.props;
		let name = this.props.name;
		if ( ! name ) {
			name = snakeCase( label );
		}
		const total = '' !== value && isNaN( parseFloat( value ) ) ? 0 : value;

		const classes = classnames( className, 'order-details__total order-details__total-edit' );
		return (
			<TableRow className={ classes }>
				<TableItem isRowHeader className="order-details__totals-label">
					{ label }
				</TableItem>
				<TableItem className="order-details__totals-value" colSpan="2">
					<PriceInput
						name={ name }
						currency={ currency }
						onBlur={ onBlur }
						onChange={ onChange }
						initialValue={ initialValue }
						value={ total }
						noWrap="true"
					/>
				</TableItem>
			</TableRow>
		);
	};

	render() {
		if ( this.props.isEditable ) {
			return this.renderEditable();
		}
		const { className, currency, label, value, showTax, taxValue } = this.props;

		const tax = (
			<TableItem className="order-details__totals-tax">
				{ formatCurrency( taxValue, currency ) }
			</TableItem>
		);
		const classes = classnames( className, 'order-details__total' );

		return (
			<TableRow className={ classes }>
				<TableItem isRowHeader className="order-details__totals-label">
					{ label }
				</TableItem>
				{ showTax && tax }
				<TableItem className="order-details__totals-value">
					{ formatCurrency( value, currency ) }
				</TableItem>
			</TableRow>
		);
	}
}

export default localize( OrderTotalRow );
