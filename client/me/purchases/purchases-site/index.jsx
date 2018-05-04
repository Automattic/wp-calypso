/** @format */

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
import { getSite, isRequestingSite } from 'state/sites/selectors';
import { isJetpackPlan } from 'lib/products-values';
import QuerySites from 'components/data/query-sites';
import PurchaseItem from '../purchase-item';
import PurchaseSiteHeader from './header';
import PurchaseReconnectNotice from './reconnect-notice';

const PurchasesSite = ( {
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

	if ( isPlaceholder ) {
		items = times( 2, index => <PurchaseItem isPlaceholder key={ index } /> );
	} else {
		items = purchases.map( purchase => (
			<PurchaseItem key={ purchase.id } slug={ slug } purchase={ purchase } />
		) );
	}

	const isJetpack = some( purchases, purchase => isJetpackPlan( purchase ) );

	return (
		<div className={ classNames( 'purchases-site', { 'is-placeholder': isPlaceholder } ) }>
			<QuerySites siteId={ siteId } />
			<PurchaseSiteHeader
				siteId={ siteId }
				name={ name }
				domain={ domain }
				isPlaceholder={ isPlaceholder }
			/>

			{ items }

			{ ! isPlaceholder && hasLoadedSite && ! site ? (
				<PurchaseReconnectNotice isJetpack={ isJetpack } name={ name } domain={ domain } />
			) : null }
		</div>
	);
};

PurchasesSite.propTypes = {
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
