/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { getLink } from 'client/extensions/woocommerce/lib/nav-utils';
import TableRow from 'client/extensions/woocommerce/components/table/table-row';
import TableItem from 'client/extensions/woocommerce/components/table/table-item';

const ProductsListRow = ( { site, product } ) => {
	// The first returned image from the API is the featured image.
	const featuredImage = product.images && product.images[ 0 ];
	const imageClasses = classNames( 'products__list-image', {
		'is-thumb-placeholder': ! featuredImage,
	} );

	const renderImage = () => (
		<div className={ imageClasses }>{ featuredImage && <img src={ featuredImage.src } /> }</div>
	);

	const categoryNames =
		product.categories &&
		product.categories.map( function( category ) {
			return category.name;
		} );

	const renderCategories = () => (
		<div className="products__list-categories">
			{ ( categoryNames && categoryNames.join( ', ' ) ) || <span>-</span> }
		</div>
	);

	const renderStock = () => (
		<div>
			{ ( product.manage_stock &&
				'simple' === product.type && <span>{ product.stock_quantity }</span> ) || <span>-</span> }
		</div>
	);

	return (
		<TableRow href={ getLink( '/store/product/:site/' + product.id, site ) }>
			<TableItem isTitle className="products__list-product">
				{ renderImage() }
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
