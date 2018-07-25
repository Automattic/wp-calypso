/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import AllSites from 'blocks/all-sites';
import AsyncLoad from 'components/async-load';
import analytics from 'lib/analytics';
import Button from 'components/button';
import Card from 'components/card';
import Site from 'blocks/site';
import Gridicon from 'gridicons';
import SiteNotice from './notice';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSite } from 'state/ui/selectors';
import getSelectedOrAllSites from 'state/selectors/get-selected-or-all-sites';
import getVisibleSites from 'state/selectors/get-visible-sites';
import { hasAllSitesList } from 'state/sites/selectors';

class CurrentSite extends Component {
	static propTypes = {
		siteCount: PropTypes.number.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
		selectedSite: PropTypes.object,
		translate: PropTypes.func.isRequired,
		anySiteSelected: PropTypes.array,
	};

	switchSites = event => {
		event.preventDefault();
		event.stopPropagation();
		this.props.setLayoutFocus( 'sites' );

		analytics.ga.recordEvent( 'Sidebar', 'Clicked Switch Site' );
	};

	render() {
		const { selectedSite, translate, anySiteSelected } = this.props;

		if ( ! anySiteSelected.length || ( ! selectedSite && ! this.props.hasAllSitesList ) ) {
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			return (
				<Card className="current-site is-loading">
					<div className="site">
						<a className="site__content">
							<div className="site-icon" />
							<div className="site__info">
								<span className="site__title">{ translate( 'Loading My Sites…' ) }</span>
							</div>
						</a>
					</div>
				</Card>
			);
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		}

		return (
			<Card className="current-site">
				{ this.props.siteCount > 1 && (
					<span className="current-site__switch-sites">
						<Button borderless onClick={ this.switchSites }>
							<Gridicon icon="chevron-left" />
							<span className="current-site__switch-sites-label">
								{ translate( 'Switch Site' ) }
							</span>
						</Button>
					</span>
				) }

				{ selectedSite ? (
					<div>
						<Site site={ selectedSite } />
					</div>
				) : (
					<AllSites />
				) }

				<SiteNotice site={ selectedSite } />
				<AsyncLoad require="my-sites/current-site/domain-warnings" placeholder={ null } />
				<AsyncLoad require="my-sites/current-site/stale-cart-items-notice" placeholder={ null } />
			</Card>
		);
	}
}

export default connect(
	state => ( {
		selectedSite: getSelectedSite( state ),
		anySiteSelected: getSelectedOrAllSites( state ),
		siteCount: getVisibleSites( state ).length,
		hasAllSitesList: hasAllSitesList( state ),
	} ),
	{ setLayoutFocus }
)( localize( CurrentSite ) );
