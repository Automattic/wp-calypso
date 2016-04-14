/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:menus:menu-picker' ); // eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' );


var MenuPicker = React.createClass({

	selectMenu: function( event ) {
		var menuId = event.target.value;

		this.props.menuData.ensureContentsSaved(
			this.props.confirmDiscard,
			this.selectMenuWhenClean.bind( this, menuId ) );
	},

	selectMenuWhenClean: function( menuId ) {
		// If 'Add new' has been selected
		if ( 'add-menu' === menuId ) {
			analytics.ga.recordEvent( 'Menus', 'Created New Menu' );
			this.props.menuData.addNewMenu( this.props.selectedLocation );
			return;
		}

		menuId = Number( menuId );
		analytics.ga.recordEvent( 'Menus', 'Selected Menu' );
		this.props.menuData.setMenuAtLocation( menuId, this.props.selectedLocation );
	},

	getMenuCount: function() {
		// exclude local data for default menu
		var defaultMenuId = this.props.menuData.getDefaultMenuId(),
			realMenusCount = this.props.menus.filter( function( menu ) {
				return menu.id !== defaultMenuId;
		} ).length;

		// but still count default menu as a menu
		return realMenusCount + ( this.props.isPrimaryLocation ? 1 : 0 );
	},

	recordClick: function() {
		analytics.ga.recordEvent( 'Menus', 'Clicked Menu Dropdown' );
	},

	renderEmptyOption: function() {
		if ( ( ! this.props.menuData.hasDefaultMenu() && this.props.isPrimaryLocation ) || ! this.props.isPrimaryLocation ) {
			return (
				<option key="default" value="">
					{ this.props.isPrimaryLocation ? this.translate( 'Default Menu', { textOnly: true } ) :
						this.translate( 'No Menu', { textOnly: true } ) }
				</option>
			);
		}
	},

	render: function() {
		var menus, title,
			defaultMenuId = this.props.menuData.getDefaultMenuId();

		menus = this.props.menus.map( function( menu ) {
			return menu.id !== defaultMenuId || this.props.isPrimaryLocation ?
				<option key={ menu.id } value={ menu.id }>{ menu.name }</option>
				: null;
		}.bind( this ) );

		title = this.translate(
				'%(numberOfMenus)s menu available',
				'%(numberOfMenus)s menus available',
				{
					count: this.getMenuCount(),
					args: {
						numberOfMenus: this.getMenuCount()
					}
				}
		);

		return (
			<div className="menus__picker is-menu">
				<label htmlFor="menu-picker-select">{ title }</label>
				<select onChange={ this.selectMenu }
						id="menu-picker-select"
						onClick={ this.recordClick }
						value={ this.props.selectedMenu ? this.props.selectedMenu.id : '' }>
					{ this.renderEmptyOption() }
					{ menus }
					<option key="noop" value='disabled' disabled> </option>
					<option key='add-menu' value='add-menu'>+ { this.translate( 'Add new menu', { textOnly: true } ) }</option>
				</select>
			</div>
		);
	}
});

module.exports = MenuPicker;
