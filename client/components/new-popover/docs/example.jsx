
/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';
import PopoverMenu from 'components/popover/menu';
import PopoverMenuItem from 'components/popover/menu-item';

/**
 * functionsStack
 */
const _fnStack = {};

const Popovers = React.createClass( {
	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			popoverPosition: 'top',
			showPopover: true,
			showPopoverMenu: false,
			popoverReference: null
		};
	},

	_changePopoverPosition( event ) {
		this.setState( { popoverPosition: event.target.value } );
	},

	closePopover() {
		console.log( 'closePopover' );
		this.setState( { showPopover: false } );
	},

	_showPopoverMenu() {
		this.setState( {
			showPopover: false,
			showPopoverMenu: ! this.state.showPopoverMenu
		} );
	},

	closePopoverMenu( action ) {
		this.setState( { showPopoverMenu: false } );

		if ( action ) {
			setTimeout( () => {
				console.log( 'PopoverMenu action: ' + action );
			}, 0 );
		}
	},

	onPopoverMenuItemBClick( closePopover ) {
		console.log( 'Custom onClick handler' );
		closePopover();
	},

	createOnShowHandler( reference ) {
		const fnName = `show-${ reference }`;

		if ( _fnStack[ fnName ] ) {
			return _fnStack[ fnName ];
		}

		return _fnStack[ fnName ] = () => {
			this.setState( { [ reference ]: true } );
		};
	},

	createOnHideHandler( reference ) {
		const fnName = `hide-${ reference }`;

		if ( _fnStack[ fnName ] ) {
			return _fnStack[ fnName ];
		}

		return _fnStack[ fnName ] = () => {
			this.setState( { [ reference ]: false } );
		};
	},

	renderMultiplePopovers() {
		const bullets = [], popovers = [];
		for ( let n = 0; n < 200; n++ ) {
			const reference = `popover-bullet-${ n }`;

			bullets.push(
				<li
					className="docs__popover-hover-example__bullet"
					key={ `bullet-${ n }` }
					onMouseEnter={ this.createOnShowHandler( reference ) }
					onMouseLeave={ this.createOnHideHandler( reference ) }
					ref={ reference }
				>
					{ n }
				</li>
			);

			popovers.push(
				<Popover
					key={ `popover-${ n }` }
					isVisible={ this.state[ reference ] || false }
					onClose={ this.createOnHideHandler( reference ) }
					position={ this.state.popoverPosition }
					context={ this.refs && this.refs[ reference ] }
					group="grid-popovers"
				>
					<div className="docs__popover-hover-example__content">
						Lorem ipsum <strong>{ reference }</strong> dolor sit amet.
					</div>
				</Popover>
			);
		}

		return (
			<div className="docs__popover-hover-example">
				<ul>{ bullets }</ul>
				{ popovers }
			</div>
		);
	},

	showPopover( event ) {
		//console.log( 'event: ', event );
		this.setState( {
			showPopover: ! this.state.showPopover,
			popoverReference: event.currentTarget,
			showPopoverMenu: false
		} );
	},

	swapPopoverVisibility() {
		console.log( 'swapPopoverVisibility' );
		this.setState( { showPopover: ! this.state.showPopover } );
	},

	getContext( reference ) {
		return this.refs && this.refs[ reference ];
	},

	renderPopover() {
		return (
			<div>
				<button
					className="button"
					ref="popoverButton"
					onClick={ this.swapPopoverVisibility }
				>
					Show Popover
				</button>

				<Popover
					isVisible={ this.state.showPopover }
					onClose={ this.closePopover }
					position={ this.state.popoverPosition }
					context={ this.getContext( 'popoverButton' ) || this.state.popoverReference }
				>
					<div style={ { padding: '16px' } }>Your popover content.</div>
				</Popover>
			</div>
		);
	},

	renderMenuPopover() {
		return (
			<div>
				<button
						className="button"
						ref="popoverMenuButton"
						onClick={ this._showPopoverMenu }
					>
					Show Popover Menu
				</button>

				<hr />

				<PopoverMenu
					isVisible={ this.state.showPopoverMenu }
					onClose={ this.closePopoverMenu }
					position={ this.state.popoverPosition }
					context={ this.refs && this.refs.popoverMenuButton }
				>
					<PopoverMenuItem action="A">Item A</PopoverMenuItem>
					<PopoverMenuItem action="B" onClick={ this.onPopoverMenuItemBClick }>Item B</PopoverMenuItem>
					<PopoverMenuItem action="C">Item C</PopoverMenuItem>
				</PopoverMenu>
			</div>
		);
	},

	render() {
		return (
			<div className="docs__design-assets-group">
				<h2>
					<a href="/devdocs/design/popovers">Popovers</a>
				</h2>
				<label>Position
					<select
						value={ this.state.popoverPosition }
						onChange={ this._changePopoverPosition }
					>
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

				{ this.renderPopover() }

				{
					// this.renderMenuPopover()
				}

				{
					// this.renderMultiplePopovers()
				}
			</div>
		);
	}
} );

export default Popovers;
