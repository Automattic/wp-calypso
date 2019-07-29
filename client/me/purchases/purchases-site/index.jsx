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
import AsyncLoad from 'components/async-load';
import { getSite, isRequestingSite } from 'state/sites/selectors';
import { isJetpackPlan } from 'lib/products-values';
import { JETPACK_PLANS } from 'lib/plans/constants';
import { JETPACK_BACKUP_PRODUCTS } from 'lib/products-values/constants';
import QuerySites from 'components/data/query-sites';
import PurchaseItem from '../purchase-item';
import PurchaseSiteHeader from './header';
import PurchaseReconnectNotice from './reconnect-notice';
import getConciergeNextAppointment from 'state/selectors/get-concierge-next-appointment';
import QueryConciergeInitial from 'components/data/query-concierge-initial';

/**
 * Style dependencies
 */
import './style.scss';

const PurchasesSite = ( {
	hasLoadedSite,
	isPlaceholder,
	site,
	siteId,
	purchases,
	name,
	domain,
	slug,
	nextAppointment,
} ) => {
	let items;

	const isJetpack = ! isPlaceholder && some( purchases, purchase => isJetpackPlan( purchase ) );

	if ( isPlaceholder ) {
		items = times( 2, index => <PurchaseItem isPlaceholder key={ index } /> );
	} else {
		items = purchases.map( purchase => (
			<PurchaseItem
				key={ purchase.id }
				slug={ slug }
				siteId={ siteId }
				isDisconnectedSite={ ! site }
				purchase={ purchase }
				isJetpack={ isJetpack }
			/>
		) );
	}

	return (
		<div className={ classNames( 'purchases-site', { 'is-placeholder': isPlaceholder } ) }>
			<QuerySites siteId={ siteId } />
			{ siteId && <QueryConciergeInitial siteId={ siteId } /> }
			<PurchaseSiteHeader
				siteId={ siteId }
				nextAppointment={ nextAppointment }
				name={ name }
				domain={ domain }
				isPlaceholder={ isPlaceholder }
			/>

			{ items }

			<AsyncLoad
				require="blocks/product-plan-overlap-notices"
				placeholder={ null }
				plans={ JETPACK_PLANS }
				products={ JETPACK_BACKUP_PRODUCTS }
				siteId={ siteId }
			/>

			{ ! isPlaceholder && hasLoadedSite && ! site && (
				<PurchaseReconnectNotice isJetpack={ isJetpack } name={ name } />
			) }
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
	nextAppointment: getConciergeNextAppointment( state ),
} ) )( PurchasesSite );
