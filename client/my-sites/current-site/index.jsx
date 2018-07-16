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
import CartStore from 'lib/cart/store';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSectionName, getSelectedSite } from 'state/ui/selectors';
import getSelectedOrAllSites from 'state/selectors/get-selected-or-all-sites';
import getVisibleSites from 'state/selectors/get-visible-sites';
import { infoNotice, removeNotice } from 'state/notices/actions';
import { getNoticeLastTimeShown } from 'state/notices/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import isRtl from 'state/selectors/is-rtl';
import { hasAllSitesList } from 'state/sites/selectors';

class CurrentSite extends Component {
	static propTypes = {
		siteCount: PropTypes.number.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
		selectedSite: PropTypes.object,
		translate: PropTypes.func.isRequired,
		anySiteSelected: PropTypes.array,
	};

	componentWillMount() {
		CartStore.on( 'change', this.showStaleCartItemsNotice );
	}

	componentWillUnmount() {
		CartStore.off( 'change', this.showStaleCartItemsNotice );
	}

	showStaleCartItemsNotice = () => {
		const { selectedSite } = this.props,
			cartItems = require( 'lib/cart-values' ).cartItems,
			staleCartItemNoticeId = 'stale-cart-item-notice';

		// Remove any existing stale cart notice
		this.props.removeNotice( staleCartItemNoticeId );

		// Don't show on the checkout page?
		if ( this.props.sectionName === 'upgrades' ) {
			return null;
		}

		// Show a notice if there are stale items in the cart and it hasn't been shown in the last 10 minutes (cart abandonment)
		if (
			selectedSite &&
			cartItems.hasStaleItem( CartStore.get() ) &&
			this.props.staleCartItemNoticeLastTimeShown < Date.now() - 10 * 60 * 1000
		) {
			this.props.recordTracksEvent( 'calypso_cart_abandonment_notice_view' );

			this.props.infoNotice( this.props.translate( 'Your cart is awaiting payment.' ), {
				id: staleCartItemNoticeId,
				isPersistent: false,
				duration: 10000,
				button: this.props.translate( 'Complete your purchase' ),
				href: '/checkout/' + selectedSite.slug,
				onClick: this.clickStaleCartItemsNotice,
			} );
		}
	};

	clickStaleCartItemsNotice = () => {
		this.props.recordTracksEvent( 'calypso_cart_abandonment_notice_click' );
	};

	switchSites = event => {
		event.preventDefault();
		event.stopPropagation();
		this.props.setLayoutFocus( 'sites' );

		analytics.ga.recordEvent( 'Sidebar', 'Clicked Switch Site' );
	};

	render() {
		const { selectedSite, translate, anySiteSelected, rtlOn } = this.props;

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
							<Gridicon icon={ rtlOn ? 'chevron-right' : 'chevron-left' } />
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
			</Card>
		);
	}
}

export default connect(
	state => ( {
		rtlOn: isRtl( state ),
		selectedSite: getSelectedSite( state ),
		anySiteSelected: getSelectedOrAllSites( state ),
		siteCount: getVisibleSites( state ).length,
		staleCartItemNoticeLastTimeShown: getNoticeLastTimeShown( state, 'stale-cart-item-notice' ),
		sectionName: getSectionName( state ),
		hasAllSitesList: hasAllSitesList( state ),
	} ),
	{ setLayoutFocus, infoNotice, removeNotice, recordTracksEvent }
)( localize( CurrentSite ) );
