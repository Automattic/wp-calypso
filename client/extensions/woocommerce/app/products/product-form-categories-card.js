/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { find, pick, compact, escape, unescape } from 'lodash';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import TokenField from 'components/token-field';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { generateProductCategoryId } from 'woocommerce/state/ui/product-categories/actions';

// TODO Rename this card since it contains other controls, and may contain more in the future (like tax)
const ProductFormCategoriesCard = ( {
	siteId,
	product,
	productCategories,
	editProduct,
	editProductCategory,
	translate,
} ) => {
	const handleChange = ( categoryNames ) => {
		const newCategories = compact(
			categoryNames.map( ( label ) => {
				const escapedCategoryName = escape( label );
				const category = find( productCategories, ( cat ) => {
					return escape( cat.label ) === escapedCategoryName;
				} );

				if ( ! category ) {
					// Add a new product category to the creates list.
					const newCategoryId = generateProductCategoryId();
					editProductCategory( siteId, { id: newCategoryId }, { name: label, label } );
					return { id: newCategoryId };
				}

				return pick( category, 'id' );
			} )
		);

		// Update the categories list.
		const data = { id: product.id, categories: newCategories };
		editProduct( siteId, product, data );
	};

	const toggleFeatured = () => {
		editProduct( siteId, product, { featured: ! product.featured } );
	};

	const selectedCategories = product.categories || [];
	const selectedCategoryNames = compact(
		selectedCategories.map( ( c ) => {
			const category = find( productCategories, { id: c.id } );
			return ( category && unescape( category.label ) ) || undefined;
		} )
	);
	const productCategoryNames = productCategories.map( ( c ) => unescape( c.label ) );

	return (
		<Card className="products__categories-card">
			<FormFieldSet>
				<FormLabel htmlFor="categories">{ translate( 'Category' ) }</FormLabel>
				<TokenField
					name="categories"
					placeholder={ translate( 'Enter category names' ) }
					value={ selectedCategoryNames }
					suggestions={ productCategoryNames }
					onChange={ handleChange }
				/>
				<FormSettingExplanation>
					{ translate(
						'Categories let you group similar products so customers can find them more easily.'
					) }
				</FormSettingExplanation>
			</FormFieldSet>
			<div className="products__product-form-featured">
				<FormLabel htmlFor="featured">
					{ translate( 'Featured' ) }
					<CompactFormToggle onChange={ toggleFeatured } checked={ product.featured }>
						{ translate( 'Promote this product across the store' ) }
					</CompactFormToggle>
				</FormLabel>
			</div>
		</Card>
	);
};

ProductFormCategoriesCard.propTypes = {
	siteId: PropTypes.number,
	product: PropTypes.shape( {
		id: PropTypes.isRequired,
		type: PropTypes.string,
	} ),
	productCategories: PropTypes.array.isRequired,
	editProduct: PropTypes.func.isRequired,
};

export default localize( ProductFormCategoriesCard );
