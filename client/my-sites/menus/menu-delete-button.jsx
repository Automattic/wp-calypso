/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	debug = require( 'debug' )( 'calypso:menus:delete-button' ); // eslint-disable-line no-unused-vars

/**
 * Internal dependencies
 */
var siteMenus = require( 'lib/menu-data' ),
	analytics = require( 'analytics' ),
	notices = require( 'notices' );

var MenuDeleteButton = React.createClass( {
	delete: function() {
		analytics.ga.recordEvent( 'Menus', 'Trashed Menu' );

		this.setBusyState();
		siteMenus.deleteMenu( this.props.selectedMenu, this.onDeletedMenu );
	},

	onDeletedMenu: function( err ) {
		this.clearBusyState();

		if ( ! err ) {
			this.showUndoNotice();
		}
	},

	undo: function( event, close ) {
		// User might have modified something in the meantime
		siteMenus.ensureContentsSaved( this.props.confirmDiscard, function() {
			close();
			this.setBusyState();
			siteMenus.restoreMenu( this.props.selectedLocation, this.clearBusyState );
		}.bind( this ) );
	},

	setBusyState: function() {
		debug( 'setBusyState' );
		this.props.setBusy( true );
	},

	clearBusyState: function() {
		debug( 'clearBusyState' );
		this.props.setBusy( false );
	},

	showUndoNotice: function() {
		notices.info( this.getUndoNoticeText(), {
			button: this.getUndoButtonLabel(),
			onClick: this.undo
		} );
	},

	getUndoNoticeText: function() {
		return this.translate( '"%s" deleted.', {
			args: [ this.props.selectedMenu.name ],
			context: 'Top notice to confirm menu deletion. Has an "Undo" button on the side.'
		} );
	},

	getUndoButtonLabel: function() {
		return this.translate( 'Undo?', {
			context: 'Ask whether user wants to undo a deletion'
		} );
	},

	render: function() {
		var classes = 'button noticon noticon-trash';
		return (
			this.props.selectedMenu.id !== 0 ?
			<button className={ classes } onClick={ this.delete } /> :
			null
		);
	}
} );

module.exports = MenuDeleteButton;
