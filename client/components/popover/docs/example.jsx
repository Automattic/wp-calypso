/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Popover from 'client/components/popover';
import PopoverMenu from 'client/components/popover/menu';
import PopoverMenuItem from 'client/components/popover/menu-item';

class PopoverExample extends PureComponent {
	constructor( props ) {
		super( props );

		this.changePopoverPosition = this.changePopoverPosition.bind( this );
		this.swapPopoverVisibility = this.swapPopoverVisibility.bind( this );
		this.closePopover = this.closePopover.bind( this );
		this.showPopoverMenu = this.showPopoverMenu.bind( this );
		this.closePopoverMenu = this.closePopoverMenu.bind( this );

		this.state = {
			popoverPosition: 'bottom left',
			showPopover: false,
			showPopoverMenu: false,
		};
	}

	// set position for all popovers
	changePopoverPosition( event ) {
		this.setState( { popoverPosition: event.target.value } );
	}

	swapPopoverVisibility() {
		this.setState( { showPopover: ! this.state.showPopover } );
	}

	closePopover() {
		this.setState( { showPopover: false } );
	}

	showPopoverMenu() {
		this.setState( {
			showPopoverMenu: ! this.state.showPopoverMenu,
		} );
	}

	closePopoverMenu() {
		this.setState( { showPopoverMenu: false } );
	}

	renderPopover() {
		return (
			<div>
				<button className="button" ref="popoverButton" onClick={ this.swapPopoverVisibility }>
					Show Popover
				</button>

				<Popover
					id="popover__basic-example"
					isVisible={ this.state.showPopover }
					onClose={ this.closePopover }
					position={ this.state.popoverPosition }
					context={ this.refs && this.refs.popoverButton }
				>
					<div style={ { padding: '10px' } }>Simple Popover Instance</div>
				</Popover>
			</div>
		);
	}

	renderMenuPopover() {
		return (
			<div>
				<button className="button" ref="popoverMenuButton" onClick={ this.showPopoverMenu }>
					Show Popover Menu
				</button>

				<br />

				<PopoverMenu
					id="popover__menu-example"
					isVisible={ this.state.showPopoverMenu }
					onClose={ this.closePopoverMenu }
					position={ this.state.popoverPosition }
					context={ this.refs && this.refs.popoverMenuButton }
				>
					<PopoverMenuItem action="A">Item A</PopoverMenuItem>
					<PopoverMenuItem action="B">Item B</PopoverMenuItem>
					<PopoverMenuItem action="C">Item C</PopoverMenuItem>
				</PopoverMenu>
			</div>
		);
	}

	render() {
		return (
			<div>
				<label>
					Position
					<select value={ this.state.popoverPosition } onChange={ this.changePopoverPosition }>
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

				<hr />

				{ this.renderPopover() }

				<hr />

				{ this.renderMenuPopover() }
			</div>
		);
	}
}

PopoverExample.displayName = 'Popover';

export default PopoverExample;
