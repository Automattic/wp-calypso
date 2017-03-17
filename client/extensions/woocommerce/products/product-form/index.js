/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import ProductVariationTypesForm from '../product-variation-types-form';
import FormToggle from 'components/forms/form-toggle';

export default class ProductForm extends Component {

	static propTypes = {
		product: PropTypes.shape( {
			id: PropTypes.number.isRequired,
			name: PropTypes.string.isRequired,
			type: PropTypes.string.isRequired,
		} )
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
		const isNewProduct = this.props.product ? false : true;
		return (
			<FoldableCard
				icon=""
				expanded={ true }
				className="product-variations"
				header={ ( <FormToggle onChange={ this.handleToggle } checked={ this.state.isVariation }>
					{ isNewProduct ? i18n.translate( 'This product has variations, for example size and color.' )
					: i18n.translate( '%(productName) has variations, for example size and color.', {
						args: {
							productName: this.props.product.name,
						}
					} )
					}
				</FormToggle>
				) }
			>

				{ this.state.isVariation  && (
					<ProductVariationTypesForm />
				) }
			</FoldableCard>
		);
	}

}
