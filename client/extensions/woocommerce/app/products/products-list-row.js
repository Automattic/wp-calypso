/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { unescape } from 'lodash';

/**
 * Internal dependencies
 */
import { getLink } from 'woocommerce/lib/nav-utils';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';
import ImageThumb from 'woocommerce/components/image-thumb';

const ProductsListRow = ( { site, product } ) => {
	// The first returned image from the API is the featured image.
	const featuredImage = product.images && product.images[ 0 ];

	const categoryNames =
		product.categories &&
		product.categories.map( function ( category ) {
			return unescape( category.name );
		} );

	const renderCategories = () => (
		<div className="products__list-categories">
			{ ( categoryNames && categoryNames.join( ', ' ) ) || <span>-</span> }
		</div>
	);

	const renderStock = () => (
		<div>
			{ ( product.manage_stock && 'simple' === product.type && (
				<span>{ product.stock_quantity }</span>
			) ) || <span>-</span> }
		</div>
	);

	return (
		<TableRow href={ getLink( '/store/product/:site/' + product.id, site ) }>
			<TableItem isTitle className="products__list-product">
				<ImageThumb src={ ( featuredImage && featuredImage.src ) || '' } alt="" />
				<span className="products__list-name">{ product.name }</span>
			</TableItem>
			<TableItem>{ renderStock() }</TableItem>
			<TableItem>{ renderCategories() }</TableItem>
		</TableRow>
	);
};

ProductsListRow.propTypes = {
	site: PropTypes.shape( {
		slug: PropTypes.string,
	} ),
	product: PropTypes.shape( {
		id: PropTypes.number,
		name: PropTypes.string,
		manage_stock: PropTypes.bool,
		stock_quantity: PropTypes.number,
		images: PropTypes.array,
		categories: PropTypes.array,
	} ),
};

export default ProductsListRow;
