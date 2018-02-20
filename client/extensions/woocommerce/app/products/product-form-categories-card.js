/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { compact } from 'lodash';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import FormFieldSet from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import TermSelector from 'woocommerce/components/term-selector';

const ProductFormCategoriesCard = ( { siteId, product, editProduct, translate } ) => {
	const handleChange = category => {
		const selectedCategories = product.categories || [];
		let found = false;
		const newCategories = compact(
			selectedCategories.map( c => {
				if ( c.id === category.ID ) {
					found = true;
					return null;
				}
				return c;
			} )
		);

		if ( ! found ) {
			newCategories.push( { id: category.ID } );
		}

		editProduct( siteId, product, { categories: newCategories } );
	};

	const selectedCategories = product.categories || [];
	const selectedCategoryIds = compact(
		selectedCategories.map( c => {
			return c.id;
		} )
	);

	return (
		<FoldableCard
			className="products__categories-card"
			header={ translate( 'Categories' ) }
			clickableHeader
			expanded
		>
			<FormFieldSet>
				<TermSelector
					siteId={ siteId }
					postType="product"
					taxonomy="product_cat"
					selected={ selectedCategoryIds }
					onChange={ handleChange }
					multiple
					showAddTerm
					onAddTerm={ handleChange }
					emptyMessage={ translate( 'No categories found.' ) }
				/>
			</FormFieldSet>
			<FormSettingExplanation>
				{ translate(
					'Categories let you group similar products so customers can find them more easily.'
				) }
			</FormSettingExplanation>
		</FoldableCard>
	);
};

ProductFormCategoriesCard.propTypes = {
	siteId: PropTypes.number,
	product: PropTypes.shape( {
		id: PropTypes.isRequired,
		type: PropTypes.string,
	} ),
};

export default localize( ProductFormCategoriesCard );
