/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import { getSelectedSiteId } from 'state/ui/selectors';

import { editProduct, editProductAttribute } from '../../state/ui/products/actions';
import { getCurrentlyEditingProduct } from '../../state/ui/products/selectors';
import { getProductVariationsWithLocalEdits } from '../../state/ui/products/variations/selectors';
import { editProductVariation } from '../../state/ui/products/variations/actions';
import { fetchProductCategories } from '../../state/wc-api/product-categories/actions';
import { getProductCategories } from '../../state/wc-api/product-categories/selectors';
import ProductForm from './product-form';

class ProductCreate extends React.Component {
	static propTypes = {
		className: PropTypes.string,
		siteId: PropTypes.number,
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
		} ),
		fetchProductCategories: PropTypes.func.isRequired,
		editProduct: PropTypes.func.isRequired,
		editProductAttribute: PropTypes.func.isRequired,
	};

	componentDidMount() {
		const { product, siteId } = this.props;

		if ( ! product ) {
			this.props.editProduct( null, {
				type: 'simple'
			} );
		}

		if ( siteId ) {
			this.props.fetchProductCategories( siteId );
		}
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.siteId !== this.props.siteId ) {
			this.props.fetchProductCategories( newProps.siteId );
		}
	}

	componentWillUnmount() {
		// TODO: Remove the product we added here from the edit state.
	}

	render() {
		const { product, className, variations, productCategories } = this.props;

		return (
			<Main className={ className }>
				<ProductForm
					product={ product || { type: 'simple' } }
					variations={ variations }
					productCategories={ productCategories }
					editProduct={ this.props.editProduct }
					editProductAttribute={ this.props.editProductAttribute }
					editProductVariation={ this.props.editProductVariation }
				/>
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	const product = getCurrentlyEditingProduct( state );
	const variations = product && getProductVariationsWithLocalEdits( state, product.id );
	const productCategories = getProductCategories( state, siteId );

	return {
		siteId,
		product,
		variations,
		productCategories,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			editProduct,
			editProductAttribute,
			editProductVariation,
			fetchProductCategories,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( ProductCreate );
