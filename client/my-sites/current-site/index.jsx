import { isEnabled } from '@automattic/calypso-config';
import { Button, Card } from '@automattic/components';
import clsx from 'clsx';
import { localize, withRtl } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Site from 'calypso/blocks/site';
import AsyncLoad from 'calypso/components/async-load';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import getSelectedOrAllSites from 'calypso/state/selectors/get-selected-or-all-sites';
import { hasAllSitesList } from 'calypso/state/sites/selectors';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

class CurrentSite extends Component {
	static propTypes = {
		siteCount: PropTypes.number.isRequired,
		setLayoutFocus: PropTypes.func.isRequired,
		selectedSite: PropTypes.object,
		translate: PropTypes.func.isRequired,
		anySiteSelected: PropTypes.array,
		forceAllSitesView: PropTypes.bool,
		isRtl: PropTypes.bool,
	};

	switchSites = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		this.props.setLayoutFocus( 'sites' );
		this.props.recordTracksEvent( 'calypso_switch_site_click' );
		this.props.recordGoogleEvent( 'Sidebar', 'Clicked Switch Site' );
	};

	onAllSitesClick = () => {
		this.props.recordTracksEvent( 'calypso_sidebar_all_sites_click' );
	};

	renderSiteSwitcher = () => {
		const { translate, isRtl } = this.props;
		const arrowDirection = isRtl ? 'right' : 'left';

		return (
			<span className="current-site__switch-sites">
				<Button borderless href="/sites" onClick={ this.onAllSitesClick }>
					<span
						// eslint-disable-next-line wpcalypso/jsx-classname-namespace
						className={ `gridicon dashicons-before dashicons-arrow-${ arrowDirection }-alt2` }
					></span>
					<span className="current-site__switch-sites-label">{ translate( 'All Sites' ) }</span>
				</Button>
			</span>
		);
	};

	render() {
		const { selectedSite, translate, anySiteSelected } = this.props;

		if ( ! anySiteSelected.length || ( ! selectedSite && ! this.props.hasAllSitesList ) ) {
			const hasNoSites = this.props.hasAllSitesList && ! anySiteSelected.length;
			/* eslint-disable wpcalypso/jsx-classname-namespace, jsx-a11y/anchor-is-valid */
			return (
				<Card
					className={ clsx( 'current-site', {
						'is-no-sites': hasNoSites,
						'is-loading': ! this.props.hasAllSitesList,
					} ) }
				>
					<div className="site">
						<a className="site__content">
							<div className="site-icon" />
							<div className="site__info">
								<span className="site__title">
									{ hasNoSites ? translate( 'No Sites' ) : translate( 'Loading My Sites…' ) }
								</span>
							</div>
						</a>
					</div>
				</Card>
			);
			/* eslint-enable wpcalypso/jsx-classname-namespace, jsx-a11y/anchor-is-valid */
		}

		return (
			<Card className="current-site">
				<div role="button" tabIndex="0" aria-hidden="true" onClick={ this.expandUnifiedNavSidebar }>
					{ this.renderSiteSwitcher() }

					{ selectedSite && (
						<div>
							<Site site={ selectedSite } homeLink />
						</div>
					) }
					{ selectedSite && isEnabled( 'current-site/domain-warning' ) && (
						<AsyncLoad
							require="calypso/my-sites/current-site/domain-warnings"
							placeholder={ null }
						/>
					) }
					{ selectedSite && isEnabled( 'current-site/stale-cart-notice' ) && (
						<CalypsoShoppingCartProvider>
							<AsyncLoad
								require="calypso/my-sites/current-site/stale-cart-items-notice"
								placeholder={ null }
							/>
						</CalypsoShoppingCartProvider>
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
	} ),
	{
		recordGoogleEvent,
		recordTracksEvent,
		setLayoutFocus,
		savePreference,
	}
)( withRtl( localize( CurrentSite ) ) );
