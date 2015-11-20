/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	startsWith = require( 'lodash/string/startsWith' ),
	Dispatcher = require( 'dispatcher' ),
	find = require( 'lodash/collection/find' ),
	propertyOf = require( 'lodash/utility/propertyOf' ),
	flatten = require( 'lodash/array/flatten' ),
	map = require( 'lodash/collection/map' ),
	sortBy = require( 'lodash/collection/sortBy' ),
	size = require( 'lodash/collection/size' ),
	filter = require( 'lodash/collection/filter' ),
	includes = require( 'lodash/collection/includes' );

/**
 * Internal dependencies
 */
var SectionNav = require( 'components/section-nav' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	NavItem = require( 'components/section-nav/item' ),
	config = require( 'config' ),
	upgradesPaths = require( 'my-sites/upgrades/paths' ),
	viewport = require( 'lib/viewport' ),
	upgradesActionTypes = require( 'lib/upgrades/constants' ).action,
	PopoverCart = require( 'my-sites/upgrades/cart/popover-cart' ),
	i18n = require( 'lib/mixins/i18n' );

// The first path acts as the primary path that the button will link to. The
// remaining paths will make the button highlighted on that page.

var NAV_ITEMS = {
	Plans: {
		paths: [ '/plans' ],
		label: i18n.translate( 'Plans' ),
		external: false
	},

	Email: {
		paths: [ upgradesPaths.domainManagementEmail() ],
		label: i18n.translate( 'Email' ),
		external: false
	},

	Domains: {
		paths: [
			upgradesPaths.domainManagementRoot(),
			'/domains/add'
		],
		label: i18n.translate( 'Domains' ),
		external: false
	},

	'Add a Domain': {
		paths: [ '/domains/add' ],
		label: i18n.translate( 'Add a Domain' ),
		external: false
	},

	'My Domains': {
		paths: [ '/my-domains' ],
		label: i18n.translate( 'My Domains' ),
		external: true
	},

	'My Upgrades': {
		paths: [ '/my-upgrades' ],
		label: i18n.translate( 'My Upgrades' ),
		external: true
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
			if ( payload.action.type === upgradesActionTypes.OPEN_CART_POPUP ) {
				this.setState( { cartVisible: true, cartShowKeepSearching: payload.action.options.showKeepSearching } );
			} else if ( payload.action.type === upgradesActionTypes.CLOSE_CART_POPUP ) {
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
			items = [ 'Plans', 'My Upgrades' ];
		} else if ( config.isEnabled( 'upgrades/domain-management/list' ) ) {
			items = [ 'Plans', 'Domains', 'Email', 'My Upgrades' ];
			if ( config.isEnabled( 'upgrades/purchases/list' ) ) {
				items = [ 'Plans', 'Domains', 'Email' ];
			}
		} else {
			items = [ 'Plans', 'Add a Domain', 'My Domains', 'My Upgrades' ];
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
			}, this );

		return find( this.getNavItemData(), function( itemData ) {
			return includes( itemData.paths, selectedPath );
		} );
	},

	navItem: function( itemData ) {
		var { paths, external, label } = itemData,
			slug = this.props.selectedSite ? this.props.selectedSite.slug : null,
			selectedNavItem = this.getSelectedNavItem(),
			primaryPath = paths[ 0 ],
			fullPath;

		if ( external ) {
			fullPath = `https://wordpress.com${primaryPath}`;
		} else {
			fullPath = slug ? `${ primaryPath }/${ slug }` : primaryPath;
		}

		return (
			<NavItem path={ fullPath }
					isExternalLink={ external }
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
