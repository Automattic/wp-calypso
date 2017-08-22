/** @format */
/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import { over } from 'lodash';

/**
 * Internal dependencies
 */
import Popover from 'components/popover';

const PopoverMenu = React.createClass( {
	propTypes: {
		autoPosition: PropTypes.bool,
		isVisible: PropTypes.bool.isRequired,
		onClose: PropTypes.func.isRequired,
		position: PropTypes.string,
		className: PropTypes.string,
		rootClassName: PropTypes.string,
		popoverComponent: PropTypes.func,
		popoverTitle: PropTypes.string, // used by ReaderPopover
	},

	getDefaultProps: function() {
		return {
			autoPosition: true,
			position: 'top',
			popoverComponent: Popover,
		};
	},

	componentWillUnmount: function() {
		// Make sure we don't hold on to reference to the DOM reference
		this._previouslyFocusedElement = null;
	},

	render: function() {
		const children = React.Children.map( this.props.children, this._setPropsOnChild, this );
		const PopoverComponent = this.props.popoverComponent;
		return (
			<PopoverComponent
				isVisible={ this.props.isVisible }
				context={ this.props.context }
				autoPosition={ this.props.autoPosition }
				position={ this.props.position }
				onClose={ this._onClose }
				onShow={ this._onShow }
				className={ this.props.className }
				rootClassName={ this.props.rootClassName }
				popoverTitle={ this.props.popoverTitle }
			>
				<div
					ref="menu"
					role="menu"
					className="popover__menu"
					onKeyDown={ this._onKeyDown }
					tabIndex="-1"
				>
					{ children }
				</div>
			</PopoverComponent>
		);
	},

	_setPropsOnChild: function( child ) {
		if ( child == null ) {
			return child;
		}

		const boundOnClose = this._onClose.bind( this, child.props.action );
		let onClick = boundOnClose;

		if ( child.props.onClick ) {
			onClick = over( [ child.props.onClick, boundOnClose ] );
		}

		return React.cloneElement( child, {
			onClick: onClick,
		} );
	},

	_onShow: function() {
		const elementToFocus = ReactDom.findDOMNode( this.refs.menu );

		this._previouslyFocusedElement = document.activeElement;

		if ( elementToFocus ) {
			elementToFocus.focus();
		}
	},

	_isInvalidTarget: function( target ) {
		return target.tagName === 'HR';
	},

	/*
	 * Warning:
	 *
	 * This doesn't cover crazy things like a separator at the very top or
	 * bottom.
	 */
	_getClosestSibling: function( target, isDownwardMotion = true ) {
		const menu = ReactDom.findDOMNode( this.refs.menu );

		let first = menu.firstChild,
			last = menu.lastChild;

		if ( ! isDownwardMotion ) {
			first = menu.lastChild;
			last = menu.firstChild;
		}

		if ( target === menu ) {
			return first;
		}

		const closest = target[ isDownwardMotion ? 'nextSibling' : 'previousSibling' ];

		const sibling = closest || last;

		return this._isInvalidTarget( sibling )
			? this._getClosestSibling( sibling, isDownwardMotion )
			: sibling;
	},

	_onKeyDown: function( event ) {
		const target = event.target;
		let handled = false;
		let elementToFocus;

		switch ( event.keyCode ) {
			case 9: // tab
				this.props.onClose();
				handled = true;
				break;
			case 38: // up arrow
				elementToFocus = this._getClosestSibling( target, false );
				handled = true;
				break;
			case 40: // down arrow
				elementToFocus = this._getClosestSibling( target, true );
				handled = true;
				break;
			default:
				break; // do nothing
		}

		if ( elementToFocus ) {
			elementToFocus.focus();
		}

		if ( handled ) {
			event.preventDefault();
		}
	},

	_onClose: function( action ) {
		if ( this._previouslyFocusedElement ) {
			this._previouslyFocusedElement.focus();
			this._previouslyFocusedElement = null;
		}

		if ( this.props.onClose ) {
			this.props.onClose( action );
		}
	},
} );

module.exports = PopoverMenu;
