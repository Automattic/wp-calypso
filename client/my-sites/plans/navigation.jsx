/**
 * External dependencies
 */
import { isMobile } from '@automattic/viewport';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { sectionify } from 'calypso/lib/route';
import SectionNav from 'calypso/components/section-nav';
import NavTabs from 'calypso/components/section-nav/tabs';
import NavItem from 'calypso/components/section-nav/item';
import PopoverCart from 'calypso/my-sites/checkout/cart/popover-cart';
import isSiteOnFreePlan from 'calypso/state/selectors/is-site-on-free-plan';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSite, isJetpackSite } from 'calypso/state/sites/selectors';

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

			default:
				return path.split( '?' )[ 0 ].replace( /\//g, ' ' );
		}
	}

	render() {
		const { site, shouldShowMyPlan, translate } = this.props;
		const path = sectionify( this.props.path );
		const sectionTitle = this.getSectionTitle( path );
		const cartToggleButton = this.cartToggleButton();
		const hasPinnedItems = isMobile() && cartToggleButton != null;

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
					</NavTabs>
					{ cartToggleButton }
				</SectionNav>
			)
		);
	}

	toggleCartVisibility = () => {
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

export default connect( ( state ) => {
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
