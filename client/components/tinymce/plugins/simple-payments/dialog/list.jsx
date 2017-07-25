/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import ProductListItem from './list-item';

class ProductList extends Component {
	static propTypes = {
		paymentButtons: PropTypes.array.isRequired,
		selectedPaymentId: PropTypes.number,
		onSelectedChange: PropTypes.func,
		onEditClick: PropTypes.func,
		onTrashClick: PropTypes.func,
	};

	static defaultProps = {
		selectedPaymentId: null,
		onSelectedChange: noop,
		onEditClick: noop,
		onTrashClick: noop,
	};

	render() {
		const {
			paymentButtons,
			selectedPaymentId,
			onSelectedChange,
			onEditClick,
			onTrashClick,
		} = this.props;

		return (
			<div className="editor-simple-payments-modal__list">
				{ paymentButtons.map( ( { ID: paymentId, title, price, currency } ) =>
					<ProductListItem
						key={ paymentId }
						paymentId={ paymentId }
						isSelected={ selectedPaymentId === paymentId }
						title={ title }
						price={ price }
						currency={ currency }
						onSelectedChange={ onSelectedChange }
						onEditClick={ onEditClick }
						onTrashClick={ onTrashClick }
					/>,
				) }
			</div>
		);
	}
}

export default ProductList;
