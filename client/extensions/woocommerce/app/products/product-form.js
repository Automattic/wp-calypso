/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import i18n from 'i18n-calypso';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import ProductVariationTypesForm from './product-variation-types-form';
import FormToggle from 'components/forms/form-toggle';
import { editProduct } from '../../state/products/actions';

class ProductForm extends Component {

	static propTypes = {
		product: PropTypes.object.isRequired,
		editProduct: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.handleVariationToggle = this.handleVariationToggle.bind( this );
	}

	handleVariationToggle() {
		const { product } = this.props;
		if ( product.type && 'variable' === product.type ) {
			// @Todo Simple is default. This check will change once options for the other product types are added.
			this.props.editProduct( product.id, 'type', 'simple' );
		} else {
			this.props.editProduct( product.id, 'type', 'variable' );
		}
	}

	render() {
		const { product } = this.props;
		const variationToggleDescription = i18n.translate(
			'%(productName)s has variations, for example size and color.', {
				args: {
					productName: product && product.name || i18n.translate( 'This product' )
				}
			}
		);
		return (
			<FoldableCard
				icon=""
				expanded={ true }
				className="product-variations"
				header={ ( <FormToggle onChange={ this.handleVariationToggle } checked={ 'variable' === product.type }>
				{variationToggleDescription}
				</FormToggle>
				) }
			>
				{ 'variable' === product.type && (
					<ProductVariationTypesForm
						product={ product }
						editProduct={ this.props.editProduct }
					/>
				) }
			</FoldableCard>
		);
	}

}

function mapStateToProps( state ) {
	const { products } = state.extensions.woocommerce;
	// @TODO Load in proper product when editing an existing product.
	return {
		product: products.edits.add,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			editProduct,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( ProductForm );
