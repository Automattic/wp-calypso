/**
 * External dependencies
 *
 * @format
 */

import React from 'react';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	getPromotions,
	getPromotionsPage,
	getPromotionsCurrentPage,
	getPromotionsPerPage,
} from 'woocommerce/state/selectors/promotions';
import PromotionsListTable from './promotions-list-table';
import PromotionsListPagination from './promotions-list-pagination';
import { setPromotionsPage } from 'woocommerce/state/ui/promotions/actions';

const PromotionsList = props => {
	const { site, promotions, promotionsPage, currentPage, perPage } = props;

	const switchPage = index => {
		if ( site ) {
			props.setPromotionsPage( site.ID, index, perPage );
		}
	};

	return (
		<div className="promotions__list-wrapper">
			<PromotionsListTable site={ site } promotions={ promotionsPage } />
			<PromotionsListPagination
				site={ site }
				promotionsLoaded={ promotions && promotions.length >= 0 }
				totalPromotions={ promotions && promotions.length }
				currentPage={ currentPage }
				perPage={ perPage }
				onSwitchPage={ switchPage }
			/>
		</div>
	);
};

PromotionsList.propTypes = {
	site: PropTypes.object,
	promotions: PropTypes.array,
	currentPage: PropTypes.number,
	perPage: PropTypes.number,
	promotionsPage: PropTypes.array,
};

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const currentPage = site && getPromotionsCurrentPage( state );
	const perPage = site && getPromotionsPerPage( state );
	const promotions = site && getPromotions( state, site.ID );
	const promotionsPage = site && getPromotionsPage( state, site.ID, currentPage, perPage );

	return {
		site,
		promotions,
		promotionsPage,
		currentPage,
		perPage,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			setPromotionsPage,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( PromotionsList );
