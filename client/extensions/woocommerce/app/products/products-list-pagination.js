/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Pagination from 'components/pagination';

const ProductsListPagination = ( {
	site,
	totalProducts,
	currentPage,
	currentPageLoaded,
	requestedPage,
	onSwitchPage,
} ) => {
	const perPage = 10;

	if ( totalProducts && totalProducts < perPage + 1 ) {
		return null;
	}

	if ( ! site || ! currentPageLoaded ) {
		return <div className="products__list-placeholder pagination" />;
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
