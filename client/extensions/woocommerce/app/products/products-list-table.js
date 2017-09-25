/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import ProductsListRow from './products-list-row';
import Table from 'woocommerce/components/table';
import TableItem from 'woocommerce/components/table/table-item';
import TableRow from 'woocommerce/components/table/table-row';

const ProductsListTable = ( { translate, products, site, isRequesting } ) => {
	const headings = (
		<TableRow isHeader className={ classNames( { 'products__list-placeholder': ! products } ) }>
			{ [ translate( 'Product' ), translate( 'Inventory' ), translate( 'Category' ) ].map( ( item, i ) =>
				<TableItem isHeader key={ i } isTitle={ 0 === i }>{ item }</TableItem>
			) }
		</TableRow>
	);

	return (
		<div>
			<Table header={ headings } className={ classNames( { 'is-requesting': isRequesting } ) } horizontalScroll>
				{ products && products.map( ( product, i ) => (
					<ProductsListRow
						key={ i }
						site={ site }
						product={ product }
					/>
				) ) }
			</Table>
			{ ! products && ( <div className="products__list-placeholder"></div> ) }
		</div>
	);
};

ProductsListTable.propTypes = {
	isRequesting: PropTypes.bool,
	site: PropTypes.shape( {
		slug: PropTypes.string,
	} ),
	products: PropTypes.oneOfType( [
		PropTypes.array,
		PropTypes.bool,
	] ),
};

export default localize( ProductsListTable );
