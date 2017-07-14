/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';
import CompactCard from 'components/card/compact';
import FormRadio from 'components/forms/form-radio';

class ProductList extends Component {
	static propTypes = {
		paymentButtons: PropTypes.array.isRequired,
		selectedPaymentId: PropTypes.number,
		onSelectedChange: PropTypes.func,
	};

	static defaultProps = {
		selectedPaymentId: null,
		onSelectedChange: noop,
	};

	handleRadioChange = event => {
		this.props.onSelectedChange( parseInt( event.target.value ) );
	};

	render() {
		const { paymentButtons, selectedPaymentId } = this.props;

		return (
			<div className="editor-simple-payments-modal__list">
				{ paymentButtons.map( ( { ID: paymentId, title, price, currency } ) => {
					const radioId = `simple-payments-list-item-radio-${ paymentId }`;

					return (
						<CompactCard className="editor-simple-payments-modal__list-item" key={ paymentId }>
							<FormRadio
								name="selection"
								id={ radioId }
								value={ paymentId }
								checked={ selectedPaymentId === paymentId }
								onChange={ this.handleRadioChange }
							/>
							<label className="editor-simple-payments-modal__list-label" htmlFor={ radioId }>
								<div>{ title }</div><div>{ formatCurrency( price, currency ) }</div>
							</label>
						</CompactCard>
					);
				} ) }
			</div>
		);
	}
}

export default localize( ProductList );
