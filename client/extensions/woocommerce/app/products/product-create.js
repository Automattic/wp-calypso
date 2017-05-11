/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCurrentlyEditingProduct } from '../../state/ui/products/selectors';
import { getProductVariationsWithLocalEdits } from '../../state/ui/products/variations/selectors';
import { editProduct, editProductAttribute } from '../../state/ui/products/actions';
import { editProductVariation } from '../../state/ui/products/variations/actions';
import Main from 'components/main';
import ProductForm from './product-form';

class ProductCreate extends Component {
	static propTypes = {
		className: PropTypes.string,
	};

	componentDidMount() {
		const { product } = this.props;

		if ( ! product ) {
			this.props.editProduct( null, {
				type: 'simple'
			} );
		}
	}

	componentWillUnmount() {
		// TODO: Remove the product we added here from the edit state.
	}

	render() {
		const { product, className, variations } = this.props;

		return (
			<Main className={ className }>
				<ProductForm
					product={ product || { type: 'simple' } }
					variations={ variations }
					editProduct={ this.props.editProduct }
					editProductAttribute={ this.props.editProductAttribute }
					editProductVariation={ this.props.editProductVariation }
				/>
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const product = getCurrentlyEditingProduct( state );
	const variations = product && getProductVariationsWithLocalEdits( state, product.id );

	return {
		product,
		variations,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			editProduct,
			editProductAttribute,
			editProductVariation,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( ProductCreate );
