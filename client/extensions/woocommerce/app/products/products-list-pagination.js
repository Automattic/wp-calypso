/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Pagination from 'calypso/components/pagination';
import { DEFAULT_QUERY } from 'woocommerce/state/sites/products/utils';

const ProductsListPagination = ( {
	site,
	totalProducts,
	currentPage,
	currentPageLoaded,
	requestedPage,
	onSwitchPage,
} ) => {
	if ( totalProducts && totalProducts < DEFAULT_QUERY.per_page + 1 ) {
		return null;
	}

	if ( ! site || ! currentPageLoaded ) {
		return <div className="products__list-placeholder pagination" />;
	}

	const page = requestedPage || currentPage;
	return (
		<Pagination
			page={ page }
			perPage={ DEFAULT_QUERY.per_page }
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
