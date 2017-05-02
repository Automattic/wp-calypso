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
import { editProduct, editProductAttribute } from '../../state/ui/products/actions';
import { getProductCategories } from '../../state/wc-api/product-categories/actions';
import ProductForm from './product-form';

class ProductCreate extends React.Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
			type: PropTypes.string.isRequired,
		} ),
		dispatchGetProductCategories: PropTypes.func.isRequired,
	};

	componentDidMount() {
		const { product, siteId, dispatchGetProductCategories } = this.props;

		if ( ! product ) {
			this.props.editProduct( null, {
				type: 'simple'
			} );
		}

		dispatchGetProductCategories( siteId );
	}

	componentWillUnmount() {
		// TODO: Remove the product we added here from the edit state.
	}

	render() {
		const { product } = this.props;

		return (
			<ProductForm
				product={ product || { type: 'simple' } }
				editProduct={ this.props.editProduct }
				editProductAttribute={ this.props.editProductAttribute }
			/>
		);
	}
}

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	const product = getCurrentlyEditingProduct( state );

	return {
		siteId,
		product,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			editProduct,
			editProductAttribute,
			dispatchGetProductCategories: getProductCategories,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( ProductCreate );
