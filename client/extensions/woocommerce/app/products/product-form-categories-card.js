/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { find, pick, compact } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import TokenField from 'components/token-field';

const ProductFormCategoriesCard = (
	{ product, productCategories, editProduct, translate }
) => {
	const handleChange = ( categoryNames ) => {
		const newCategories = compact( categoryNames.map( ( name ) => {
			const category = find( productCategories, { name } );

			if ( ! category ) {
				// TODO: Add new product category to edit state.
				// TODO: Remove 'compact' calls afterwards as they will no longer be needed.
				return undefined;
			}

			return pick( category, 'id' );
		} ) );

		const data = { id: product.id, categories: newCategories };
		editProduct( product, data );
	};

	const selectedCategories = product.categories || [];
	const selectedCategoryNames = compact( selectedCategories.map( ( c ) => {
		const category = find( productCategories, { id: c.id } );
		return category && category.name || undefined;
	} ) );
	const productCategoryNames = productCategories.map( c => c.name );

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
			</FormFieldSet>
			<span className="products__categories-hint">{ translate( 'Add a category so this product is easy to find.' ) }</span>
		</Card>
	);
};

ProductFormCategoriesCard.propTypes = {
	product: PropTypes.shape( {
		id: PropTypes.isRequired,
		type: PropTypes.string.isRequired,
	} ),
	productCategories: PropTypes.array.isRequired,
	editProduct: PropTypes.func.isRequired,
};

export default localize( ProductFormCategoriesCard );

