/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import ProductVariationTypesForm from './product-variation-types-form';
import FormToggle from 'components/forms/form-toggle';

const ProductFormVariationsCard = ( { product, editProduct, translate, editProductAttribute } ) => {
	const handleToggle = () => {
		if ( 'variable' !== product.type ) {
			editProduct( product, { type: 'variable' } );
		} else {
			// TODO: Don't clear out all attributes when implementing "additional details" (non variation attributes).
			editProduct( product, { type: 'simple', attributes: null } );
		}
	};

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
			header={ ( <FormToggle onChange={ handleToggle } checked={ 'variable' === product.type }>
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
};

ProductFormVariationsCard.propTypes = {
	product: PropTypes.shape( {
		id: PropTypes.isRequired,
		type: PropTypes.string.isRequired,
		name: PropTypes.string,
	} ),
	editProduct: PropTypes.func.isRequired,
	editProductAttribute: PropTypes.func.isRequired,
};

export default localize( ProductFormVariationsCard );
