/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ProductsListPagination from './products-list-pagination';
import ProductsListTable from './products-list-table';
import { getTotalProductSearchResults, areProductSearchResultsLoaded, getProductSearchQuery } from 'woocommerce/state/sites/products/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getProductSearchCurrentPage, getProductSearchResults, getProductSearchRequestedPage } from 'woocommerce/state/ui/products/selectors';

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
							searchTerm: <em>{ query }</em>
						}
					} )}
				</p>
			</div>
		);
	}

	const isRequesting = ( requestedPage && ! requestedPageLoaded ) || ! products ? true : false;
	return (
		<div className="products__list-wrapper">
			<ProductsListTable
				site={ site }
				products={ products }
				isRequesting={ isRequesting }
			/>
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
	products: PropTypes.oneOfType( [
		PropTypes.array,
		PropTypes.bool,
	] ),
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
	const currentPage = site && getProductSearchCurrentPage( state, site.ID );
	const currentPageLoaded = site && currentPage && areProductSearchResultsLoaded( state, currentPage, site.ID );
	const requestedPage = site && getProductSearchRequestedPage( state, site.ID );
	const requestedPageLoaded = site && requestedPage && areProductSearchResultsLoaded( state, requestedPage, site.ID );
	const totalProducts = site && getTotalProductSearchResults( state, site.ID );
	const products = site && getProductSearchResults( state, site.ID );
	const query = site && getProductSearchQuery( state, site.ID );

	return {
		site,
		currentPage,
		currentPageLoaded,
		requestedPage,
		requestedPageLoaded,
		products,
		totalProducts,
		query,
	};
}

export default connect( mapStateToProps )( localize( ProductsListSearchResults ) );
