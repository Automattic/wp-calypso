/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import ProductVariationTypesForm from './product-variation-types-form';
import FormToggle from 'components/forms/form-toggle';

class ProductFormVariationCard extends Component {

	static propTypes = {
		product: PropTypes.shape( {
			id: PropTypes.isRequired,
			type: PropTypes.string.isRequired,
			name: PropTypes.string,
		} ),
		editProduct: PropTypes.func.isRequired,
		editProductAttribute: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );

		this.handleToggle = this.handleToggle.bind( this );
	}

	handleToggle() {
		const { product, editProduct } = this.props;
		const type = 'variable' !== product.type ? 'variable' : 'simple';
		editProduct( product, { type } );
	}

	render() {
		const { product, translate, editProductAttribute } = this.props;
		const variationToggleDescription = translate(
			'%(productName)s has variations, for example size and color.', {
				args: {
					productName: ( product && product.name ) || translate( 'This product' )
				}
			}
		);

		return (
			<FoldableCard
				icon=""
				expanded
				className="products__variation-card"
				header={ ( <FormToggle onChange={ this.handleToggle } checked={ 'variable' === product.type }>
					{ variationToggleDescription }
				</FormToggle>
				) }
			>
				{ 'variable' === product.type && (
					<ProductVariationTypesForm
						product={ product }
						editProductAttribute={ editProductAttribute }
					/>
				) }
			</FoldableCard>
		);
	}
}

export default localize( ProductFormVariationCard );
