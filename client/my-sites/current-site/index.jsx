/**
 * External dependencies
 */
import React, { Component } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AllSites from 'my-sites/all-sites';
import AsyncLoad from 'components/async-load';
import analytics from 'lib/analytics';
import Button from 'components/button';
import Card from 'components/card';
import Site from 'blocks/site';
import Gridicon from 'gridicons';
import config from 'config';
import SiteNotice from './notice';
import CartStore from 'lib/cart/store';
import { setLayoutFocus } from 'state/ui/layout-focus/actions';
import { getSelectedSite } from 'state/ui/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedOrAllSites } from 'state/selectors';
import { infoNotice, removeNotice } from 'state/notices/actions';
import { getNoticeLastTimeShown } from 'state/notices/selectors';
import { getSectionName } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

class CurrentSite extends Component {
	static propTypes = {
		isPreviewShowing: React.PropTypes.bool,
		siteCount: React.PropTypes.number.isRequired,
		setLayoutFocus: React.PropTypes.func.isRequired,
		selectedSite: React.PropTypes.object,
		translate: React.PropTypes.func.isRequired,
		anySiteSelected: React.PropTypes.array
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
		if ( cartItems.hasStaleItem( CartStore.get() ) && this.props.staleCartItemNoticeLastTimeShown < Date.now() - ( 10 * 60 * 1000 ) ) {
			this.props.infoNotice(
				this.props.translate( 'Your site deserves a boost!' ),
				{
					id: staleCartItemNoticeId,
					isPersistent: false,
					duration: 10000,
					button: this.props.translate( 'Complete your purchase' ),
					href: '/checkout/' + selectedSite.slug,
					onClick: this.clickStaleCartItemsNotice
				}
			);
		}
	};

	clickStaleCartItemsNotice = () => {
		this.props.recordTracksEvent( 'calypso_cart_abandonment_notice_click' );
	};

	switchSites = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		this.props.setLayoutFocus( 'sites' );

		analytics.ga.recordEvent( 'Sidebar', 'Clicked Switch Site' );
	};

	previewSite = ( event ) => this.props.onClick && this.props.onClick( event );

	renderSiteViewLink() {
		if ( config.isEnabled( 'standalone-site-preview' ) ) {
			return;
		}

		const {
			isPreviewShowing,
			selectedSite,
			translate,
		} = this.props;

		const viewText = selectedSite.is_previewable
			? translate( 'Site Preview' )
			: translate( 'View site' );

		const viewIcon = selectedSite.is_previewable
			? 'computer'
			: 'external';

		return (
			<a
				href={ selectedSite.URL }
				onClick={ this.previewSite }
				className={ classNames( 'current-site__view-site', {
					selected: isPreviewShowing,
				} ) }
				target="_blank"
				rel="noopener noreferrer"
			>
				<span className="current-site__view-site-text">
					{ viewText }
				</span>
				<Gridicon icon={ viewIcon } />
			</a>
		);
	}

	render() {
		const { selectedSite, translate, anySiteSelected } = this.props;

		if ( ! anySiteSelected.length ) {
			return (
				<Card className="current-site is-loading">
					{ this.props.siteCount > 1 &&
						<span className="current-site__switch-sites">&nbsp;</span>
					}
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
		}

		return (
			<Card className="current-site">
				{ this.props.siteCount > 1 &&
					<span className="current-site__switch-sites">
						<Button compact borderless onClick={ this.switchSites }>
							<Gridicon icon="arrow-left" size={ 18 } />
							{ translate( 'Switch Site' ) }
						</Button>
					</span>
				}

				{ selectedSite
					? <div>
						<Site site={ selectedSite } />
						{ this.renderSiteViewLink() }
					</div>
					: <AllSites />
				}

				<AsyncLoad require="my-sites/current-site/domain-warnings" noPlaceholder={ null } />

				<SiteNotice site={ selectedSite } allSitesPath={ this.props.allSitesPath } />
			</Card>
		);
	}
}

export default connect(
	( state ) => {
		const user = getCurrentUser( state );

		return {
			selectedSite: getSelectedSite( state ),
			anySiteSelected: getSelectedOrAllSites( state ),
			siteCount: get( user, 'visible_site_count', 0 ),
			staleCartItemNoticeLastTimeShown: getNoticeLastTimeShown( state, 'stale-cart-item-notice' ),
			sectionName: getSectionName( state ),
		};
	},
	{ setLayoutFocus, infoNotice, removeNotice, recordTracksEvent },
)( localize( CurrentSite ) );
