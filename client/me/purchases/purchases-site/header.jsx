/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import { getSite } from 'calypso/state/sites/selectors';
import QuerySites from 'calypso/components/data/query-sites';
import Site from 'calypso/blocks/site';
import SitePlaceholder from 'calypso/blocks/site/placeholder';

/**
 * Style dependencies
 */
import './header.scss';

class PurchaseSiteHeader extends Component {
	static propTypes = {
		isPlaceholder: PropTypes.bool,
		siteId: PropTypes.number,
		name: PropTypes.string,
		domain: PropTypes.string,
	};

	// Disconnected sites can't render the `Site` component, but there can be
	// purchases from disconnected sites. Here we spoof the Site header.
	renderFauxSite() {
		const { name, domain } = this.props;

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
	}

	render() {
		const { isPlaceholder, siteId, site, name, domain } = this.props;
		let header;

		if ( isPlaceholder ) {
			header = <SitePlaceholder />;
		} else if ( site ) {
			header = <Site isCompact site={ site } indicator={ false } />;
		} else {
			header = this.renderFauxSite( name, domain );
		}

		return (
			<CompactCard className="purchases-site__header">
				<QuerySites siteId={ siteId } />
				{ header }
			</CompactCard>
		);
	}
}

export default connect( ( state, { siteId } ) => ( {
	site: getSite( state, siteId ),
} ) )( PurchaseSiteHeader );
