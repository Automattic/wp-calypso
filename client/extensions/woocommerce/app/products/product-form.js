/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import ProductFormDetailsCard from './product-form-details-card';
import ProductVariationTypesForm from './product-variation-types-form';
import FormToggle from 'components/forms/form-toggle';

export default class ProductForm extends Component {

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
			isVariation: props.product && 'variable' === props.product.type ? true : false,
		};

		this.handleToggle = this.handleToggle.bind( this );
	}

	handleToggle() {
		this.setState( ( prevState ) => ( {
			isVariation: ! prevState.isVariation,
		} ) );
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
			<div className="woocommerce products__form">
				<ProductFormDetailsCard
					product={ product }
					editProduct={ this.props.editProduct }
				/>

				<FoldableCard
					icon=""
					expanded={ true }
					className="products__variation-card"
					header={ ( <FormToggle onChange={ this.handleToggle } checked={ this.state.isVariation }>
					{variationToggleDescription}
					</FormToggle>
					) }
				>
					{ this.state.isVariation && (
						<ProductVariationTypesForm />
					) }
				</FoldableCard>
			</div>
		);
	}

}
