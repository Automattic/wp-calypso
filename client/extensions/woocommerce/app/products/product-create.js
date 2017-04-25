/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCurrentlyEditingProduct } from '../../state/ui/products/selectors';
import { editProduct, editProductAttribute } from '../../state/ui/products/actions';
import ProductForm from './product-form';

class ProductCreate extends Component {

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
		const { product } = this.props;

		return (
			<ProductForm
				product={ product || { type: 'simple' } }
				editProduct={ this.props.editProduct }
				editProductAttribute={ editProductAttribute }
			/>
		);
	}
}

function mapStateToProps( state ) {
	const product = getCurrentlyEditingProduct( state );

	return {
		product,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			editProduct,
			editProductAttribute,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( ProductCreate );
