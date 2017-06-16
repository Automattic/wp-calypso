/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getLink } from 'woocommerce/lib/nav-utils';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

const ProductsListRow = ( { site, product, translate } ) => {
	// The first returned image from the API is the featured image.
	const featuredImage = product.images && product.images[ 0 ];
	const imageClasses = classNames( 'products__list-image', { 'is-thumb-placeholder': ! featuredImage } );
	const renderImage = () => (
		<div className={ imageClasses }>
			{ featuredImage && ( <img src={ featuredImage.src } /> ) }
		</div>
	);

	const categoryNames = product.categories && product.categories.map( function( category ) {
		return category.name;
	} );
	const renderCategories = () => (
		<div className="products__list-categories">
			{ categoryNames && categoryNames.join( ', ' ) }
		</div>
	);

	const renderStock = () => (
		<div>
			{ product.manage_stock && 'simple' === product.type &&
				( <span>{ product.stock_quantity }</span> ) ||
				( <span>{ translate( 'N/A' ) }</span> )
			}
		</div>
	);

	return (
		<TableRow>
			<TableItem isTitle className="products__list-product">
				{ renderImage() }
				<a href={ getLink( '/store/product/:site/' + product.id, site ) }>
					{ product.name }
				</a>
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

export default localize( ProductsListRow );
