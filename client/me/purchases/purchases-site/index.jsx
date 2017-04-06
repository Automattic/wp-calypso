/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import React from 'react';
import times from 'lodash/times';

/**
 * Internal dependencies
 */
import { getSite } from 'state/sites/selectors';
import PurchaseItem from '../purchase-item';
import QuerySites from 'components/data/query-sites';
import Site from 'blocks/site';

const PurchasesSite = ( { isPlaceholder, siteId, site, purchases, slug } ) => {
	let items;

	if ( isPlaceholder ) {
		items = times( 2, index => (
			<PurchaseItem isPlaceholder key={ index } />
		) );
	} else {
		items = purchases.map( purchase => (
			<PurchaseItem
				key={ purchase.id }
				slug={ slug }
				purchase={ purchase } />
		) );
	}

	return (
		<div className={ classNames( 'purchases-site', { 'is-placeholder': isPlaceholder } ) }>
			<QuerySites siteId={ siteId } />
			<Site site={ site } />

			{ items }
		</div>
	);
};

PurchasesSite.propTypes = {
	isPlaceholder: React.PropTypes.bool,
	siteId: React.PropTypes.number,
	purchases: React.PropTypes.array,
	slug: React.PropTypes.string,
};

export default connect(
	( state, { siteId } ) => ( {
		site: getSite( state, siteId )
	} )
)( PurchasesSite );
