/**
 * External dependencies
 */

import { connect } from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { some, times } from 'lodash';

/**
 * Internal dependencies
 */
import AsyncLoad from 'calypso/components/async-load';
import { getSite, isRequestingSite } from 'calypso/state/sites/selectors';
import { isJetpackPlan } from 'calypso/lib/products-values';
import { JETPACK_PLANS } from 'calypso/lib/plans/constants';
import { JETPACK_PRODUCTS_LIST } from 'calypso/lib/products-values/constants';
import QuerySites from 'calypso/components/data/query-sites';
import PurchaseItem from '../purchase-item';
import PurchaseSiteHeader from './header';
import PurchaseReconnectNotice from './reconnect-notice';
import { managePurchase } from '../paths';

/**
 * Style dependencies
 */
import './style.scss';

const PurchasesSite = ( {
	showHeader = true,
	getManagePurchaseUrlFor = managePurchase,
	hasLoadedSite,
	isPlaceholder,
	site,
	siteId,
	purchases,
	name,
	domain,
	slug,
} ) => {
	let items;

	const isJetpack = ! isPlaceholder && some( purchases, ( purchase ) => isJetpackPlan( purchase ) );

	if ( isPlaceholder ) {
		items = times( 2, ( index ) => <PurchaseItem isPlaceholder key={ index } /> );
	} else {
		items = purchases.map( ( purchase ) => (
			<PurchaseItem
				getManagePurchaseUrlFor={ getManagePurchaseUrlFor }
				key={ purchase.id }
				slug={ slug }
				isDisconnectedSite={ ! site }
				purchase={ purchase }
				isJetpack={ isJetpack }
			/>
		) );
	}

	return (
		<div className={ classNames( 'purchases-site', { 'is-placeholder': isPlaceholder } ) }>
			<QuerySites siteId={ siteId } />

			{ ( showHeader || isPlaceholder ) && (
				<PurchaseSiteHeader
					siteId={ siteId }
					name={ name }
					domain={ domain }
					isPlaceholder={ isPlaceholder }
				/>
			) }

			{ items }

			<AsyncLoad
				require="calypso/blocks/product-plan-overlap-notices"
				placeholder={ null }
				plans={ JETPACK_PLANS }
				products={ JETPACK_PRODUCTS_LIST }
				siteId={ siteId }
			/>

			{ ! isPlaceholder && hasLoadedSite && ! site && (
				<PurchaseReconnectNotice isJetpack={ isJetpack } name={ name } />
			) }
		</div>
	);
};

PurchasesSite.propTypes = {
	showHeader: PropTypes.bool,
	getManagePurchaseUrlFor: PropTypes.func,
	isPlaceholder: PropTypes.bool,
	siteId: PropTypes.number,
	purchases: PropTypes.array,
	name: PropTypes.string,
	domain: PropTypes.string,
	slug: PropTypes.string,
};

export default connect( ( state, { siteId } ) => ( {
	site: getSite( state, siteId ),
	hasLoadedSite: ! isRequestingSite( state, siteId ),
} ) )( PurchasesSite );
