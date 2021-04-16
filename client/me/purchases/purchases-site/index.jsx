/**
 * External dependencies
 */

import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import AsyncLoad from 'calypso/components/async-load';
import { getSite } from 'calypso/state/sites/selectors';
import {
	isJetpackPlan,
	isJetpackProduct,
	JETPACK_PLANS,
	JETPACK_PRODUCTS_LIST,
} from '@automattic/calypso-products';
import QuerySites from 'calypso/components/data/query-sites';
import PurchaseItem from '../purchase-item';
import { managePurchase } from '../paths';

/**
 * Style dependencies
 */
import './style.scss';

const PurchasesSite = ( {
	getManagePurchaseUrlFor = managePurchase,
	isPlaceholder,
	site,
	siteId,
	purchases,
	name,
	slug,
	showSite = false,
} ) => {
	if ( isPlaceholder ) {
		return <PurchaseItem isPlaceholder />;
	}

	return (
		<div className={ classNames( 'purchases-site', { 'is-placeholder': isPlaceholder } ) }>
			<QuerySites siteId={ siteId } />

			<AsyncLoad
				require="calypso/blocks/product-plan-overlap-notices"
				placeholder={ null }
				plans={ JETPACK_PLANS }
				products={ JETPACK_PRODUCTS_LIST }
				siteId={ siteId }
			/>

			{ purchases.map( ( purchase ) => (
				<PurchaseItem
					getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
					key={ purchase.id }
					slug={ slug }
					isDisconnectedSite={ ! site }
					purchase={ purchase }
					isJetpack={ isJetpackPlan( purchase ) || isJetpackProduct( purchase ) }
					site={ site }
					showSite={ showSite }
					name={ name }
				/>
			) ) }
		</div>
	);
};

PurchasesSite.propTypes = {
	getManagePurchaseUrlFor: PropTypes.func,
	isPlaceholder: PropTypes.bool,
	name: PropTypes.string,
	purchases: PropTypes.array,
	showSite: PropTypes.bool,
	siteId: PropTypes.number,
	slug: PropTypes.string,
};

export default connect( ( state, { siteId } ) => ( {
	site: getSite( state, siteId ),
} ) )( PurchasesSite );
