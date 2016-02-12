/**
 * External dependencies
 */
var React = require( 'react' ),
	startsWith = require( 'lodash/startsWith' ),
	Dispatcher = require( 'dispatcher' ),
	find = require( 'lodash/find' ),
	propertyOf = require( 'lodash/propertyOf' ),
	flatten = require( 'lodash/flatten' ),
	map = require( 'lodash/map' ),
	sortBy = require( 'lodash/sortBy' ),
	size = require( 'lodash/size' ),
	filter = require( 'lodash/filter' ),
	includes = require( 'lodash/includes' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	SectionNav = require( 'components/section-nav' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	NavItem = require( 'components/section-nav/item' ),
	upgradesPaths = require( 'my-sites/upgrades/paths' ),
	viewport = require( 'lib/viewport' ),
	upgradesActionTypes = require( 'lib/upgrades/constants' ).action,
	PopoverCart = require( 'my-sites/upgrades/cart/popover-cart' ),
	i18n = require( 'lib/mixins/i18n' );

// The first path acts as the primary path that the button will link to. The
// remaining paths will make the button highlighted on that page.

var NAV_ITEMS = {
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
		label: i18n.translate( 'Email' ),
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

var UpgradesNavigation = React.createClass( {
	propTypes: {
		cart: React.PropTypes.object.isRequired,

		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	getInitialState: function() {
		return {
			cartVisible: false,
			cartShowKeepSearching: false
		};
	},

	componentWillMount: function() {
		this.dispatchToken = Dispatcher.register( function( payload ) {
			if ( payload.action.type === upgradesActionTypes.CART_POPUP_OPEN ) {
				this.setState( { cartVisible: true, cartShowKeepSearching: payload.action.options.showKeepSearching } );
			} else if ( payload.action.type === upgradesActionTypes.CART_POPUP_CLOSE ) {
				this.setState( { cartVisible: false } );
			}
		}.bind( this ) );
	},

	componentWillUnmount: function() {
		Dispatcher.unregister( this.dispatchToken );
	},

	render: function() {
		var navItems = this.getNavItemData().map( this.navItem ),
			selectedNavItem = this.getSelectedNavItem(),
			selectedText = selectedNavItem && selectedNavItem.label;

		return (
			<SectionNav
					hasPinnedItems={ viewport.isMobile() }
					selectedText={ selectedText }
					onMobileNavPanelOpen={ this.onMobileNavPanelOpen }>
				<NavTabs label='Section' selectedText={ selectedText }>
					{ navItems }
				</NavTabs>
				{ this.cartToggleButton() }
			</SectionNav>
		);
	},

	getNavItemData: function() {
		var items;

		if ( this.props.selectedSite.jetpack ) {
			items = [ 'Addons' ];
		} else {
			items = [ 'Plans', 'Domains', 'Email' ];
		}

		return items.map( propertyOf( NAV_ITEMS ) );
	},

	getSelectedNavItem: function() {
		var allPaths = flatten( map( this.getNavItemData(), 'paths' ) ),
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

	navItem: function( itemData ) {
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

	toggleCartVisibility: function( event ) {
		if ( event ) {
			event.preventDefault();
		}

		this.setState( { cartVisible: ! this.state.cartVisible } );
	},

	onMobileNavPanelOpen: function() {
		this.setState( { cartVisible: false } );
	},

	onKeepSearchingClick: function() {
		this.setState( { cartVisible: false } );
	},

	cartToggleButton: function() {
		if ( ! config.isEnabled( 'upgrades/checkout' ) ) {
			return null;
		}

		return (
			<PopoverCart
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

module.exports = UpgradesNavigation;
