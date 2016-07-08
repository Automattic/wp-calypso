/**
 * External dependencies
 */
import React from 'react';
import { startsWith, find, propertyOf, flatten, map, sortBy, size, filter, includes } from 'lodash';
import Dispatcher from 'dispatcher';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import upgradesPaths from 'my-sites/upgrades/paths';
import viewport from 'lib/viewport';
import { action as upgradesActionTypes } from 'lib/upgrades/constants';
import PopoverCart from 'my-sites/upgrades/cart/popover-cart';

// The first path acts as the primary path that the button will link to. The
// remaining paths will make the button highlighted on that page.

const NAV_ITEMS = {
	Addons: {
		paths: [ '/plans' ],
		label: i18n.translate( 'Add-ons for Jetpack sites' ),
		allSitesPath: false
	},

	Plans: {
		paths: [ '/plans' ],
		label: i18n.translate( 'Plans' ),
		allSitesPath: false
	},

	Email: {
		paths: [ upgradesPaths.domainManagementEmail() ],
		label: i18n.translate( 'Google Apps' ),
		allSitesPath: false
	},

	Domains: {
		paths: [
			upgradesPaths.domainManagementRoot(),
			'/domains/add'
		],
		label: i18n.translate( 'Domains' ),
		allSitesPath: false
	},

	'Add a Domain': {
		paths: [ '/domains/add' ],
		label: i18n.translate( 'Add a Domain' ),
		allSitesPath: false
	}
};

const PlansNavigation = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object.isRequired,
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
		const navItems = this.getNavItemData().map( this.navItem ),
			selectedNavItem = this.getSelectedNavItem(),
			selectedText = selectedNavItem && selectedNavItem.label;

		return (
			<SectionNav
					hasPinnedItems={ viewport.isMobile() }
					selectedText={ selectedText }
					onMobileNavPanelOpen={ this.onMobileNavPanelOpen }>
				<NavTabs label="Section" selectedText={ selectedText }>
					{ navItems }
				</NavTabs>
				{ this.cartToggleButton() }
			</SectionNav>
		);
	},

	getNavItemData() {
		let items;

		if ( this.props.selectedSite.jetpack ) {
			items = [ 'Addons' ];
		} else {
			items = [ 'Plans', 'Domains', 'Email' ];
		}

		return items.map( propertyOf( NAV_ITEMS ) );
	},

	getSelectedNavItem() {
		const allPaths = flatten( map( this.getNavItemData(), 'paths' ) ),
			sortedPaths = sortBy( allPaths, function( path ) {
				return -countSlashes( path );
			} ),
			selectedPath = find( sortedPaths, function( path ) {
				return startsWith( this.props.path, path );
			}.bind( this ) );

		return find( this.getNavItemData(), function( itemData ) {
			return includes( itemData.paths, selectedPath );
		} );
	},

	navItem( itemData ) {
		var { paths, allSitesPath, label } = itemData,
			slug = this.props.selectedSite ? this.props.selectedSite.slug : null,
			selectedNavItem = this.getSelectedNavItem(),
			primaryPath = paths[ 0 ],
			fullPath;

		if ( allSitesPath ) {
			fullPath = primaryPath;
		} else {
			fullPath = slug ? `${ primaryPath }/${ slug }` : primaryPath;
		}

		return (
			<NavItem path={ fullPath }
					key={ fullPath }
					selected={ selectedNavItem && ( selectedNavItem.label === label ) }>
				{ label }
			</NavItem>
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
		if ( ! config.isEnabled( 'upgrades/checkout' ) ) {
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

function countSlashes( path ) {
	return size( filter( path, function( character ) {
		return character === '/';
	} ) );
}

export default PlansNavigation;
