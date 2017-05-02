/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';

import { getCurrentlyEditingProduct } from '../../state/ui/products/selectors';
import { getProductCategories } from '../../state/wc-api/product-categories/selectors';
import { editProduct, editProductAttribute } from '../../state/ui/products/actions';
import { getProductCategories as fetchProductCategories } from '../../state/wc-api/product-categories/actions';
import ProductForm from './product-form';

class ProductCreate extends React.Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
			type: PropTypes.string.isRequired,
		} ),
		dispatchFetchProductCategories: PropTypes.func.isRequired,
	};

	componentDidMount() {
		const { product, siteId } = this.props;

		if ( ! product ) {
			this.props.editProduct( null, {
				type: 'simple'
			} );
		}

		this.props.dispatchFetchProductCategories( siteId );
	}

	componentWillUnmount() {
		// TODO: Remove the product we added here from the edit state.
	}

	render() {
		const { product, productCategories } = this.props;

		return (
			<ProductForm
				product={ product || { type: 'simple' } }
				productCategories={ productCategories }
				editProduct={ this.props.editProduct }
				editProductAttribute={ this.props.editProductAttribute }
			/>
		);
	}
}

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	const product = getCurrentlyEditingProduct( state );
	const productCategories = getProductCategories( state, siteId );

	return {
		siteId,
		product,
		productCategories,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			editProduct,
			editProductAttribute,
			dispatchFetchProductCategories: fetchProductCategories,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( ProductCreate );
