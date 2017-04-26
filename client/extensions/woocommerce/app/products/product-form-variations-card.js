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

		this.state = {
			isVariableProduct: props.product && 'variable' === props.product.type ? true : false,
		};

		this.handleToggle = this.handleToggle.bind( this );
	}

	handleToggle() {
		this.setState( ( prevState ) => ( {
			isVariableProduct: ! prevState.isVariableProduct,
		} ) );
	}

	render() {
		const { product, translate } = this.props;
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
				header={ ( <FormToggle onChange={ this.handleToggle } checked={ this.state.isVariableProduct }>
					{ variationToggleDescription }
				</FormToggle>
				) }
			>
				{ this.state.isVariableProduct && (
					<ProductVariationTypesForm />
				) }
			</FoldableCard>
		);
	}
}

export default localize( ProductFormVariationCard );
