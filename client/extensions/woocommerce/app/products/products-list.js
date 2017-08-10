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
import Button from 'components/button';
import EmptyContent from 'components/empty-content';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	getTotalProducts,
	areProductsLoaded,
} from 'woocommerce/state/sites/products/selectors';
import {
	getProductListCurrentPage,
	getProductListProducts,
	getProductListRequestedPage,
 } from 'woocommerce/state/ui/products/selectors';
import ProductsListPagination from './products-list-pagination';
import ProductsListTable from './products-list-table';

const ProductsList = ( {
	site,
	translate,
	products,
	totalProducts,
	currentPage,
	currentPageLoaded,
	requestedPage,
	requestedPageLoaded,
	onSwitchPage,
} ) => {
	const renderEmptyContent = () => {
		const emptyContentAction = (
			<Button href={ getLink( '/store/product/:site/', site ) }>
				{ translate( 'Add your first product' ) }
			</Button>
		);
		return <EmptyContent
				title={ translate( 'You don\'t have any products yet.' ) }
				action={ emptyContentAction }
		/>;
	};

	if ( currentPageLoaded === true && totalProducts === 0 ) {
		return renderEmptyContent();
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

ProductsList.propTypes = {
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
	onSwitchPage: PropTypes.func.isRequired,
};

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const currentPage = site && getProductListCurrentPage( state, site.ID );
	const currentPageLoaded = site && currentPage && areProductsLoaded( state, currentPage, site.ID );
	const requestedPage = site && getProductListRequestedPage( state, site.ID );
	const requestedPageLoaded = site && requestedPage && areProductsLoaded( state, requestedPage, site.ID );
	const products = site && getProductListProducts( state, site.ID );
	const totalProducts = site && getTotalProducts( state, site.ID );

	return {
		site,
		currentPage,
		currentPageLoaded,
		requestedPage,
		requestedPageLoaded,
		products,
		totalProducts,
	};
}

export default connect( mapStateToProps )( localize( ProductsList ) );
