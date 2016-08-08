/**
* External dependencies
*/
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
* Internal dependencies
*/
var Popover = require( 'components/popover' ),
	PopoverMenu = require( 'components/popover/menu' ),
	PopoverMenuItem = require( 'components/popover/menu-item' );

var Popovers = React.createClass( {
	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			popoverPosition: 'top',
			showPopover: false,
			showPopoverMenu: false
		};
	},

	render: function() {
		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/popovers">Popovers</a>
				</h2>
				<label>Position
					<select value={ this.state.popoverPosition } onChange={ this._changePopoverPosition }>
						<option value="top">top</option>
						<option value="top left">top left</option>
						<option value="top right">top right</option>
						<option value="left">left</option>
						<option value="right">right</option>
						<option value="bottom">bottom</option>
						<option value="bottom left">bottom left</option>
						<option value="bottom right">bottom right</option>
					</select>
				</label>

				<br />

				<button className="button" ref="popoverButton" onClick={ this._showPopover }>Show Popover</button>
				<Popover isVisible={ this.state.showPopover }
						onClose={ this._closePopover }
						position={ this.state.popoverPosition }
						context={ this.refs && this.refs.popoverButton }>
					<div style={ { padding: '16px' } }>Your popover content.</div>
				</Popover>

				&nbsp;

				<button className="button" ref="popoverMenuButton" onClick={ this._showPopoverMenu }>Show Popover Menu</button>
				<PopoverMenu isVisible={ this.state.showPopoverMenu }
						onClose={ this._closePopoverMenu }
						position={ this.state.popoverPosition }
						context={ this.refs && this.refs.popoverMenuButton }>
					<PopoverMenuItem action="A">Item A</PopoverMenuItem>
					<PopoverMenuItem action="B" onClick={ this._onPopoverMenuItemBClick }>Item B</PopoverMenuItem>
					<PopoverMenuItem action="C">Item C</PopoverMenuItem>
				</PopoverMenu>
			</div>
		);
	},

	_changePopoverPosition: function( event ) {
		this.setState( { popoverPosition: event.target.value } );
	},

	_showPopover: function() {
		this.setState( {
			showPopover: ! this.state.showPopover,
			showPopoverMenu: false
		} );
	},

	_closePopover: function() {
		this.setState( { showPopover: false } );
	},

	_showPopoverMenu: function() {
		this.setState( {
			showPopover: false,
			showPopoverMenu: ! this.state.showPopoverMenu
		} );
	},

	_closePopoverMenu: function( action ) {
		this.setState( { showPopoverMenu: false } );

		if ( action ) {
			setTimeout( function() {
				console.log( 'PopoverMenu action: ' + action );
			}, 0 );
		}
	},

	_onPopoverMenuItemBClick: function( closePopover ) {
		console.log( 'Custom onClick handler' );
		closePopover();
	}
} );

module.exports = Popovers;
