/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { isEnabled } from 'calypso/config';
import { Button, Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import AllSites from 'calypso/blocks/all-sites';
import AsyncLoad from 'calypso/components/async-load';
import Site from 'calypso/blocks/site';
import Gridicon from 'calypso/components/gridicon';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getSelectedSite, getSidebarIsCollapsed } from 'calypso/state/ui/selectors';
import getSelectedOrAllSites from 'calypso/state/selectors/get-selected-or-all-sites';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { hasAllSitesList } from 'calypso/state/sites/selectors';
import { expandSidebar } from 'calypso/state/ui/actions';

/**
 * Style dependencies
 */
import './style.scss';

class CurrentSite extends Component {
	static propTypes = {
		siteCount: PropTypes.number.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
		selectedSite: PropTypes.object,
		translate: PropTypes.func.isRequired,
		anySiteSelected: PropTypes.array,
		forceAllSitesView: PropTypes.bool,
		sidebarIsCollapsed: PropTypes.bool,
		expandSidebar: PropTypes.func.isRequired,
	};

	switchSites = ( event ) => {
		if ( isEnabled( 'nav-unification' ) && this.props.sidebarIsCollapsed ) {
			this.props.expandSidebar();
		}
		event.preventDefault();
		event.stopPropagation();
		this.props.setLayoutFocus( 'sites' );
		this.props.recordGoogleEvent( 'Sidebar', 'Clicked Switch Site' );
	};

	render() {
		const { selectedSite, translate, anySiteSelected } = this.props;

		if ( ! anySiteSelected.length || ( ! selectedSite && ! this.props.hasAllSitesList ) ) {
			/* eslint-disable wpcalypso/jsx-classname-namespace, jsx-a11y/anchor-is-valid */
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
			/* eslint-enable wpcalypso/jsx-classname-namespace, jsx-a11y/anchor-is-valid */
		}

		return (
			<Card className="current-site">
				<div
					role="button"
					tabIndex="0"
					aria-hidden="true"
					onClick={ () => {
						return isEnabled( 'nav-unification' ) && this.props.sidebarIsCollapsed
							? this.props.expandSidebar()
							: null;
					} }
				>
					{ this.props.siteCount > 1 && (
						<span className="current-site__switch-sites">
							<Button borderless onClick={ this.switchSites }>
								{ isEnabled( 'nav-unification' ) ? (
									// eslint-disable-next-line wpcalypso/jsx-classname-namespace
									<span className="gridicon dashicons-before dashicons-arrow-left-alt2"></span>
								) : (
									<Gridicon icon="chevron-left" />
								) }
								<span className="current-site__switch-sites-label">
									{ translate( 'Switch Site' ) }
								</span>
							</Button>
						</span>
					) }

					{ selectedSite ? (
						<div>
							<Site site={ selectedSite } homeLink={ true } />
						</div>
					) : (
						<AllSites />
					) }
					{ selectedSite && isEnabled( 'current-site/domain-warning' ) && (
						<AsyncLoad
							require="calypso/my-sites/current-site/domain-warnings"
							placeholder={ null }
						/>
					) }
					{ selectedSite && isEnabled( 'current-site/stale-cart-notice' ) && (
						<AsyncLoad
							require="calypso/my-sites/current-site/stale-cart-items-notice"
							placeholder={ null }
						/>
					) }
					{ selectedSite && isEnabled( 'current-site/notice' ) && (
						<AsyncLoad
							require="calypso/my-sites/current-site/notice"
							placeholder={ null }
							site={ selectedSite }
						/>
					) }
				</div>
			</Card>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		selectedSite: ownProps.forceAllSitesView ? null : getSelectedSite( state ),
		anySiteSelected: getSelectedOrAllSites( state ),
		siteCount: getCurrentUserSiteCount( state ),
		hasAllSitesList: hasAllSitesList( state ),
		sidebarIsCollapsed: getSidebarIsCollapsed( state ),
	} ),
	{
		recordGoogleEvent,
		setLayoutFocus,
		expandSidebar,
	}
)( localize( CurrentSite ) );
