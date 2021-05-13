/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import FormLabel from 'calypso/components/forms/form-label';
import FormSelect from 'calypso/components/forms/form-select';
import Popover from 'calypso/components/popover';
import PopoverMenu from 'calypso/components/popover/menu';
import PopoverMenuItem from 'calypso/components/popover/menu-item';

const customPosition = { top: 300, left: 500 };

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
					position={ this.state.popoverPosition !== 'custom' ? this.state.popoverPosition : null }
					context={ this.refs && this.refs.popoverButton }
					customPosition={ this.state.popoverPosition === 'custom' ? customPosition : null }
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
					position={ this.state.popoverPosition !== 'custom' ? this.state.popoverPosition : null }
					context={ this.refs && this.refs.popoverMenuButton }
					customPosition={ this.state.popoverPosition === 'custom' ? customPosition : null }
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
				<FormLabel>
					Position
					<FormSelect value={ this.state.popoverPosition } onChange={ this.changePopoverPosition }>
						<option value="top">top</option>
						<option value="top left">top left</option>
						<option value="top right">top right</option>
						<option value="left">left</option>
						<option value="right">right</option>
						<option value="bottom">bottom</option>
						<option value="bottom left">bottom left</option>
						<option value="bottom right">bottom right</option>
						<option value="custom">custom</option>
					</FormSelect>
				</FormLabel>

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
