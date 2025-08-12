import { CompactCard, Gridicon } from '@automattic/components';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Site from 'calypso/blocks/site';
import SitePlaceholder from 'calypso/blocks/site/placeholder';
import QuerySites from 'calypso/components/data/query-sites';
import { getSite } from 'calypso/state/sites/selectors';
import { isTemporarySitePurchase } from '../utils';

import './header.scss';

class PurchaseSiteHeader extends Component {
	static propTypes = {
		isPlaceholder: PropTypes.bool,
		siteId: PropTypes.number,
		name: PropTypes.string,
		purchase: PropTypes.object,
	};

	// Disconnected sites can't render the `Site` component, but there can be
	// purchases from disconnected sites. Here we spoof the Site header.
	renderFauxSite() {
		const { name, purchase } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="site is-disconnected">
				<div className="site__content">
					<div className="site-icon is-blank">
						<Gridicon icon="notice" />
					</div>
					<div className="site__info">
						<div className="site__title">{ name }</div>
						<div className="site__domain">{ purchase?.domain }</div>
					</div>
				</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	render() {
		const { purchase, isPlaceholder, siteId, site } = this.props;
		let header;

		// Both the domain and name of a Jetpack temporary site don't provide any
		// meaningful information to the user.
		if ( purchase && isTemporarySitePurchase( purchase ) ) {
			return null;
		}

		if ( isPlaceholder ) {
			header = <SitePlaceholder />;
		} else if ( site ) {
			header = <Site site={ site } indicator={ false } />;
		} else {
			header = this.renderFauxSite();
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
