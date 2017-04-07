/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import React from 'react';
import times from 'lodash/times';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import { getSite } from 'state/sites/selectors';
import PurchaseItem from '../purchase-item';
import QuerySites from 'components/data/query-sites';
import Site from 'blocks/site';
import SitePlaceholder from 'blocks/site/placeholder';

// Disconnected sites can't render the `Site` component, but there can be
// purchases from disconnected sites. Here we spoof the Site header.
const renderFauxSite = ( name, domain ) => {
	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<div className="site is-disconnected">
			<div className="site__content">
				<div className="site-icon is-blank">
					<Gridicon icon="notice" />
				</div>
				<div className="site__info">
					<div className="site__title">{ name }</div>
					<div className="site__domain">{ domain }</div>
				</div>
			</div>
		</div>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */
};

const PurchasesSite = ( { isPlaceholder, siteId, site, purchases, name, domain, slug } ) => {
	let items, header;

	if ( isPlaceholder ) {
		items = times( 2, index => (
			<PurchaseItem isPlaceholder key={ index } />
		) );
		header = (
			<SitePlaceholder />
		);
	} else {
		items = purchases.map( purchase => (
			<PurchaseItem
				key={ purchase.id }
				slug={ slug }
				purchase={ purchase } />
		) );
		if ( site ) {
			header = (
				<Site isCompact site={ site } />
			);
		} else {
			header = renderFauxSite( name, domain );
		}
	}

	return (
		<div className={ classNames( 'purchases-site', { 'is-placeholder': isPlaceholder } ) }>
			<QuerySites siteId={ siteId } />
			<CompactCard className="purchases-site__header">
				{ header }
			</CompactCard>

			{ items }
		</div>
	);
};

PurchasesSite.propTypes = {
	isPlaceholder: React.PropTypes.bool,
	siteId: React.PropTypes.number,
	purchases: React.PropTypes.array,
	name: React.PropTypes.string,
	domain: React.PropTypes.string,
	slug: React.PropTypes.string,
};

export default connect(
	( state, { siteId } ) => ( {
		site: getSite( state, siteId )
	} )
)( PurchasesSite );
