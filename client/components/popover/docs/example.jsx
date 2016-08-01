
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
			showPopover: true,

			popoverPosition: 'top',
			showPopoverMenu: false,
			popoverReference: null,
			currentPopoverContent: 0,
			showMultiplePopover: true
		};
	},

	swapPopoverVisibility() {
		this.setState( { showPopover: ! this.state.showPopover } );
	},

	closePopover() {
		this.setState( { showPopover: false } );
	},

	showPopoverMenu() {
		this.setState( {
			showPopoverMenu: ! this.state.showPopoverMenu
		} );
	},

	closePopoverMenu( action ) {
		this.setState( { showPopoverMenu: false } );

		if ( action ) {
			setTimeout( () => {
				//console.log( 'PopoverMenu action: ' + action );
			}, 0 );
		}
	},

	onPopoverMenuItemBClick( closePopover ) {
		//console.log( 'Custom onClick handler' );
		closePopover();
	},

	changePopoverPosition( event ) {
		this.setState( { popoverPosition: event.target.value } );
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

	updateOnlyOnePopoverContent( event ) {
		event.preventDefault();

		const { currentTarget } = event;

		// this.setState( {
		// 	showMultiplePopover: true,
		// 	currentTarget: null,
		// } );

		// setTimeout( () => {
		// 	console.log( 'currentTarget: %o', currentTarget );

		this.setState( {
			showMultiplePopover: true,
			currentContext: currentTarget,
			currentPopoverContent: this.state.currentPopoverContent + 1,
		} );
		// }, 1000 );
	},

	closeOnlyOnePopoverContent() {
		this.setState( { showMultiplePopover: false } );
	},

	closeMultiplePopover() {
		this.setState( {
			showMultiplePopover: false,
			currentContext: null
		} );
	},

	renderPopoverContent() {
		const content = this.state.currentPopoverContent || 'init';

		if ( ! content ) {
			return null;
		}

		return (
			<div
				style={ { padding: '10px' } }
				className="docs__popover-hover-example__content"
			>
				Lorem ipsum&nbsp;
					<strong style={ { color: 'green' } }>
						{ content }
					</strong>
				&nbsp;dolor sit amet.
			</div>
		);
	},

	renderMultipleInOnlyOnePopover() {
		const bullets = [];
		for ( let n = 0; n < 999; n++ ) {
			bullets.push(
				<li
					ref={ n === 100 ? 'target-100' : null }
					className="docs__popover-hover-example__bullet"
					key={ `bullet-${ n }` }
					//onClick={ this.updateOnlyOnePopoverContent }
					onMouseEnter={ this.updateOnlyOnePopoverContent }
					//onMouseLeave={ this.closeMultiplePopover }
				>
					{ n }
				</li>
			);
		}

		return (
			<div className="docs__popover-hover-example">
				<ul
					onMouseLeave={ this.closeOnlyOnePopoverContent }
				>{ bullets }</ul>
				<Popover
					isVisible={ this.state.showMultiplePopover }
					onClose={ this.closePopover }
					position={ this.state.popoverPosition }
					context={ this.state.currentContext || this.getContext( 'target-100' ) }
				>
					{ this.renderPopoverContent() }
				</Popover>
			</div>
		);
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
					context={ this.getContext( 'popoverButton' ) }
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
						//className="button"
						ref="popoverMenuButton"
						onClick={ this.showPopoverMenu }
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
						onChange={ this.changePopoverPosition }
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

				{
					this.renderPopover()
				}

				<br />

				{
					this.renderMultipleInOnlyOnePopover()
				}

				<br />

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
