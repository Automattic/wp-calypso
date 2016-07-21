/**
 * External dependencies
 */
import React from 'react';
import Dispatcher from 'dispatcher';

/**
 * Internal dependencies
 */
import config from 'config';
import { sectionify } from 'lib/route/path';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import viewport from 'lib/viewport';
import { action as upgradesActionTypes } from 'lib/upgrades/constants';
import PopoverCart from 'my-sites/upgrades/cart/popover-cart';

const PlansNavigation = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object,
		path: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		sitePlans: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			cartVisible: false,
			cartShowKeepSearching: false
		};
	},

	componentWillMount() {
		this.dispatchToken = Dispatcher.register( function( payload ) {
			if ( payload.action.type === upgradesActionTypes.CART_POPUP_OPEN ) {
				this.setState( { cartVisible: true, cartShowKeepSearching: payload.action.options.showKeepSearching } );
			} else if ( payload.action.type === upgradesActionTypes.CART_POPUP_CLOSE ) {
				this.setState( { cartVisible: false } );
			}
		}.bind( this ) );
	},

	componentWillUnmount() {
		Dispatcher.unregister( this.dispatchToken );
	},

	render() {
		const site = this.props.selectedSite;
		const isJetpack = site && site.jetpack;
		const path = sectionify( this.props.path );
		const hasPlan = site && site.plan && site.plan.product_slug !== 'free_plan';
		const sectionTitle = path.split( '?' )[ 0 ].replace( /\//g, ' ' );

		return (
			<SectionNav
					hasPinnedItems={ viewport.isMobile() }
					selectedText={ sectionTitle }
					onMobileNavPanelOpen={ this.onMobileNavPanelOpen }>
				<NavTabs label="Section" selectedText={ sectionTitle }>
					{ hasPlan &&
						<NavItem path={ `/plans/my-plan/${ site.slug }` } key="myPlan" selected={ path === '/plans/my-plan' }>
							{ this.translate( 'My Plan' ) }
						</NavItem>
					}
					<NavItem path={ `/plans/${ site.slug }` } key="plans" selected={ path === '/plans' || path === '/plans/monthly' }>
						{ this.translate( 'Plans' ) }
					</NavItem>
					{ ! isJetpack &&
						<NavItem path={ `/domains/manage/${ site.slug }` } key="domains"
							selected={ path === '/domains/manage' || path === '/domains/add' }>
							{ this.translate( 'Domains' ) }
						</NavItem>
					}
					{ ! isJetpack &&
						<NavItem path={ `/domains/manage/email/${ site.slug }` } key="googleApps"
							selected={ path === '/domains/manage/email' }>
							{ this.translate( 'Google Apps' ) }
						</NavItem>
					}
				</NavTabs>
				{ this.cartToggleButton() }
			</SectionNav>
		);
	},

	toggleCartVisibility( event ) {
		if ( event ) {
			event.preventDefault();
		}

		this.setState( { cartVisible: ! this.state.cartVisible } );
	},

	onMobileNavPanelOpen() {
		this.setState( { cartVisible: false } );
	},

	onKeepSearchingClick() {
		this.setState( { cartVisible: false } );
	},

	cartToggleButton() {
		if ( ! config.isEnabled( 'upgrades/checkout' ) || ! this.props.cart ) {
			return null;
		}

		return (
			<PopoverCart
				sitePlans={ this.props.sitePlans }
				cart={ this.props.cart }
				selectedSite={ this.props.selectedSite }
				onToggle={ this.toggleCartVisibility }
				pinned={ viewport.isMobile() }
				visible={ this.state.cartVisible }
				showKeepSearching={ this.state.cartShowKeepSearching }
				onKeepSearchingClick={ this.onKeepSearchingClick }
				path={ this.props.path } />
		);
	}
} );

export default PlansNavigation;
