/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Pagination from 'calypso/components/pagination';

const PromotionsListPagination = ( {
	site,
	promotionsLoaded,
	totalPromotions,
	currentPage,
	perPage,
	onSwitchPage,
} ) => {
	if ( ! totalPromotions || totalPromotions <= perPage ) {
		return null;
	}

	if ( ! site || ! promotionsLoaded ) {
		return <div className="promotions__list-placeholder pagination" />;
	}

	return (
		<Pagination
			page={ currentPage }
			perPage={ perPage }
			total={ totalPromotions }
			pageClick={ onSwitchPage }
		/>
	);
};

PromotionsListPagination.propTypes = {
	site: PropTypes.object,
	promotionsLoaded: PropTypes.bool,
	totalPromotions: PropTypes.oneOfType( [ PropTypes.number, PropTypes.bool ] ),
	currentPage: PropTypes.number,
	perPage: PropTypes.number,
	onSwitchPage: PropTypes.func.isRequired,
};

export default PromotionsListPagination;
