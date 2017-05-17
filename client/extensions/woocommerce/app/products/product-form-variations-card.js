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
import ProductFormVariationsTable from './product-form-variations-table';
import FormToggle from 'components/forms/form-toggle';

const ProductFormVariationsCard = ( {
	product,
	variations,
	editProduct,
	translate,
	editProductAttribute,
	editProductVariation
} ) => {
	const handleToggle = () => {
		if ( 'variable' !== product.type ) {
			// Reset any 'simple' product settings that have been filled out,
			// since they are configured by each variation instead.
			const productData = { ...product };
			[ 'dimensions', 'weight', 'regular_price', 'manage_stock',
			'stock_quantity', 'backorders' ].forEach(
				function( field ) {
					if ( product[ field ] ) {
						productData[ field ] = null;
					}
				}
			);
			editProduct( product, {
				...productData,
				type: 'variable',
			} );
		} else {
			const attributes = ( product.attributes && product.attributes.filter( attribute => ! attribute.variation ) ) || null;
			editProduct( product, { type: 'simple', attributes } );
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
				<div>
					<ProductVariationTypesForm
						product={ product }
						editProductAttribute={ editProductAttribute }
					/>
					<ProductFormVariationsTable
						product={ product }
						variations={ variations }
						editProductVariation={ editProductVariation }
					/>
				</div>
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
	variations: PropTypes.array,
	editProduct: PropTypes.func.isRequired,
	editProductAttribute: PropTypes.func.isRequired,
	editProductVariation: PropTypes.func.isRequired,
};

export default localize( ProductFormVariationsCard );
