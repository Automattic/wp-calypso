/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Pagination from 'my-sites/stats/pagination';

const ProductsListPagination = ( { site, totalProducts, currentPage, currentPageLoaded, requestedPage, onSwitchPage } ) => {
	const perPage = 10;

	if ( totalProducts && totalProducts < ( perPage + 1 ) ) {
		return null;
	}

	if ( ! site || ! currentPageLoaded ) {
		return ( <div className="products__list-placeholder pagination"></div> );
	}

	const page = requestedPage || currentPage;
	return (
		<Pagination
			page={ page }
			perPage={ perPage }
			total={ totalProducts }
			pageClick={ onSwitchPage }
		/>
	);
};

ProductsListPagination.propTypes = {
	site: PropTypes.object,
	currentPage: PropTypes.number,
	currentPageLoaded: PropTypes.bool,
	requestedPage: PropTypes.number,
	totalProducts: PropTypes.number,
	onSwitchPage: PropTypes.func.isRequired,
};

export default ProductsListPagination;
