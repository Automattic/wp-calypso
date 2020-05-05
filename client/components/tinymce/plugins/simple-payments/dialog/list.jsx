/**
 * /* eslint-disable wpcalypso/jsx-classname-namespace
 *
 */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop, range } from 'lodash';

/**
 * Internal dependencies
 */
import ProductListItem from './list-item';
import ProductListItemPlaceholder from './list-item-placeholder';

class ProductList extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		paymentButtons: PropTypes.array,
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

	renderListItems() {
		const {
			siteId,
			paymentButtons,
			selectedPaymentId,
			onSelectedChange,
			onEditClick,
			onTrashClick,
		} = this.props;

		if ( ! paymentButtons ) {
			// Render 2 placeholder items
			return range( 2 ).map( ( i ) => <ProductListItemPlaceholder key={ i } /> );
		}

		return paymentButtons.map( ( { ID: paymentId, title, price, currency, featuredImageId } ) => (
			<ProductListItem
				key={ paymentId }
				siteId={ siteId }
				paymentId={ paymentId }
				isSelected={ selectedPaymentId === paymentId }
				title={ title }
				price={ price }
				currency={ currency }
				featuredImageId={ featuredImageId }
				onSelectedChange={ onSelectedChange }
				onEditClick={ onEditClick }
				onTrashClick={ onTrashClick }
			/>
		) );
	}

	render() {
		return <div className="editor-simple-payments-modal__list">{ this.renderListItems() }</div>;
	}
}

export default ProductList;
