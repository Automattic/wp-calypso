/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { sectionify } from 'lib/route';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import { isMobile } from 'lib/viewport';
import PopoverCart from 'my-sites/checkout/cart/popover-cart';
import { isATEnabled } from 'lib/automated-transfer';
import isSiteOnFreePlan from 'state/selectors/is-site-on-free-plan';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSite, isJetpackSite } from 'state/sites/selectors';

class PlansNavigation extends React.Component {
	static propTypes = {
		cart: PropTypes.object,
		isJetpack: PropTypes.bool,
		path: PropTypes.string.isRequired,
		shouldShowMyPlan: PropTypes.bool,
		site: PropTypes.object,
	};

	state = {
		cartVisible: false,
	};

	getSectionTitle( path ) {
		switch ( path ) {
			case '/plans/my-plan':
				return 'My Plan';

			case '/plans':
			case '/plans/monthly':
			case '/plans/yearly':
				return 'Plans';

			case '/domains/manage':
			case '/domains/add':
				return 'Domains';

			case '/email':
				return 'Email';

			default:
				return path.split( '?' )[ 0 ].replace( /\//g, ' ' );
		}
	}

	render() {
		const { isJetpack, site, shouldShowMyPlan, translate } = this.props;
		const path = sectionify( this.props.path );
		const sectionTitle = this.getSectionTitle( path );
		const userCanManageOptions = get( site, 'capabilities.manage_options', false );
		const canManageDomain = userCanManageOptions && ( isATEnabled( site ) || ! isJetpack );
		const hasPinnedItems = isMobile() && this.cartToggleButton();

		return (
			site && (
				<SectionNav
					hasPinnedItems={ hasPinnedItems }
					selectedText={ sectionTitle }
					onMobileNavPanelOpen={ this.onMobileNavPanelOpen }
				>
					<NavTabs label="Section" selectedText={ sectionTitle }>
						{ shouldShowMyPlan && (
							<NavItem
								path={ `/plans/my-plan/${ site.slug }` }
								selected={ path === '/plans/my-plan' }
							>
								{ translate( 'My Plan' ) }
							</NavItem>
						) }
						<NavItem
							path={ `/plans/${ site.slug }` }
							selected={
								path === '/plans' || path === '/plans/monthly' || path === '/plans/yearly'
							}
						>
							{ translate( 'Plans' ) }
						</NavItem>
						{ canManageDomain && (
							<NavItem
								path={ `/domains/manage/${ site.slug }` }
								selected={ path === '/domains/manage' || path === '/domains/add' }
							>
								{ translate( 'Domains' ) }
							</NavItem>
						) }
						{ canManageDomain && (
							<NavItem path={ `/email/${ site.slug }` } selected={ path === '/email' }>
								{ translate( 'Email' ) }
							</NavItem>
						) }
					</NavTabs>
					{ this.cartToggleButton() }
				</SectionNav>
			)
		);
	}

	toggleCartVisibility = event => {
		if ( event ) {
			event.preventDefault();
		}

		this.setState( { cartVisible: ! this.state.cartVisible } );
	};

	onMobileNavPanelOpen = () => {
		this.setState( { cartVisible: false } );
	};

	cartToggleButton() {
		if ( ! config.isEnabled( 'upgrades/checkout' ) || ! this.props.cart || ! this.props.site ) {
			return null;
		}

		return (
			<PopoverCart
				cart={ this.props.cart }
				selectedSite={ this.props.site }
				onToggle={ this.toggleCartVisibility }
				pinned={ isMobile() }
				visible={ this.state.cartVisible }
				path={ this.props.path }
			/>
		);
	}
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	const site = getSite( state, siteId );
	const isJetpack = isJetpackSite( state, siteId );
	const isOnFreePlan = isSiteOnFreePlan( state, siteId );
	return {
		isJetpack,
		shouldShowMyPlan: ! isOnFreePlan || isJetpack,
		site,
	};
} )( localize( PlansNavigation ) );
