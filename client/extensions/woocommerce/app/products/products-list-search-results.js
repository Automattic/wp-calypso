/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	getTotalProducts,
	areProductsLoaded,
	getProducts,
} from 'woocommerce/state/sites/products/selectors';
import {
	getProductsCurrentPage,
	getProductsCurrentSearch,
	getProductsRequestedPage,
} from 'woocommerce/state/ui/products/selectors';

import ProductsListPagination from './products-list-pagination';
import ProductsListTable from './products-list-table';

const ProductsListSearchResults = ( {
	site,
	translate,
	products,
	totalProducts,
	currentPage,
	currentPageLoaded,
	requestedPage,
	requestedPageLoaded,
	query,
	onSwitchPage,
} ) => {
	if ( currentPageLoaded === true && totalProducts === 0 ) {
		return (
			<div>
				<p>
					{ translate( 'No products match your search for {{searchTerm/}}.', {
						components: {
							searchTerm: <em>{ query }</em>,
						},
					} ) }
				</p>
			</div>
		);
	}

	const isRequesting = ( requestedPage && ! requestedPageLoaded ) || ! products ? true : false;
	return (
		<div className="products__list-wrapper">
			<ProductsListTable site={ site } products={ products } isRequesting={ isRequesting } />
			<ProductsListPagination
				site={ site }
				totalProducts={ totalProducts }
				currentPage={ currentPage }
				currentPageLoaded={ currentPageLoaded }
				requestedPage={ requestedPage }
				onSwitchPage={ onSwitchPage }
			/>
		</div>
	);
};

ProductsListSearchResults.propTypes = {
	site: PropTypes.object,
	products: PropTypes.oneOfType( [ PropTypes.array, PropTypes.bool ] ),
	currentPage: PropTypes.number,
	currentPageLoaded: PropTypes.bool,
	requestedPage: PropTypes.number,
	requestedPageLoaded: PropTypes.bool,
	totalProducts: PropTypes.number,
	query: PropTypes.string,
	onSwitchPage: PropTypes.func.isRequired,
};

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const search = site && getProductsCurrentSearch( state, site.ID );
	const currentPage = site && getProductsCurrentPage( state, site.ID );
	const currentQuery = { page: currentPage, search };
	const currentPageLoaded =
		site && currentPage && areProductsLoaded( state, currentQuery, site.ID );
	const requestedPage = site && getProductsRequestedPage( state, site.ID );
	const requestedPageLoaded =
		site && requestedPage && areProductsLoaded( state, { page: requestedPage, search }, site.ID );
	const totalProducts = site && getTotalProducts( state, currentQuery, site.ID );
	const products = site && getProducts( state, currentQuery, site.ID );

	return {
		site,
		currentPage,
		currentPageLoaded,
		requestedPage,
		requestedPageLoaded,
		products,
		totalProducts,
		query: search,
	};
}

export default connect( mapStateToProps )( localize( ProductsListSearchResults ) );
