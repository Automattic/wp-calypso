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
import { editProduct, editProductAttribute } from '../../state/ui/products/actions';
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
		const { product, className } = this.props;

		return (
			<ProductForm
				className={ className }
				product={ product || { type: 'simple' } }
				editProduct={ this.props.editProduct }
				editProductAttribute={ this.props.editProductAttribute }
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
