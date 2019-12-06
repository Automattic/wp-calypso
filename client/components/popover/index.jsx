/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import debugFactory from 'debug';
import classNames from 'classnames';
import { defer, noop } from 'lodash';
import { useRtl } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { RootChild } from '@automattic/components';
import {
	bindWindowListeners,
	unbindWindowListeners,
	suggested as suggestPosition,
	constrainLeft,
	offset,
} from './util';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:popover' );

// We accept DOM elements and React component instances as the `context` prop.
// In case of a React component instance, we'll find the DOM element with `findDOMNode`.
const PropTypeElement = PropTypes.oneOfType( [
	PropTypes.instanceOf( Component ),
	PropTypes.instanceOf( window.Element ),
] );

class PopoverInner extends Component {
	static propTypes = {
		autoPosition: PropTypes.bool,
		autoRtl: PropTypes.bool,
		className: PropTypes.string,
		closeOnEsc: PropTypes.bool,
		id: PropTypes.string,
		context: PropTypeElement,
		ignoreContext: PropTypeElement,
		isRtl: PropTypes.bool,
		isVisible: PropTypes.bool,
		position: PropTypes.oneOf( [
			'top',
			'top right',
			'right',
			'bottom right',
			'bottom',
			'bottom left',
			'left',
			'top left',
		] ),
		showDelay: PropTypes.number,
		onClose: PropTypes.func,
		onShow: PropTypes.func,
		relativePosition: PropTypes.shape( { left: PropTypes.number } ),
		// Bypass position calculations and provide custom position values
		customPosition: PropTypes.shape( {
			top: PropTypes.number,
			left: PropTypes.number,
			positionClass: PropTypes.oneOf( [ 'top', 'right', 'bottom', 'left' ] ),
		} ),
	};

	static defaultProps = {
		autoPosition: true,
		autoRtl: true,
		className: '',
		closeOnEsc: true,
		isRtl: false,
		isVisible: false,
		position: 'top',
		showDelay: 0,
		onClose: noop,
		onShow: noop,
	};

	/**
	 * Flag to determine if we're currently repositioning the Popover
	 *
	 * @type {boolean} True if the Popover is being repositioned.
	 */
	isUpdatingPosition = false;

	popoverNodeRef = React.createRef();
	popoverInnerNodeRef = React.createRef();

	state = {
		show: this.props.isVisible,
		left: -99999,
		top: -99999,
		positionClass: this.getPositionClass( this.props.position ),
	};

	componentDidMount() {
		if ( this.state.show ) {
			this.bindListeners();
			this.setPositionAndFocus();
		}
	}

	componentDidUpdate( prevProps, prevState ) {
		// Show can be delayed with `showDelay`, so `state.show` lags behind `props.isVisible`
		if ( this.props.isVisible !== prevProps.isVisible ) {
			if ( this.props.isVisible ) {
				this.show();
			} else {
				this.hide();
			}
		}

		// When showing, bind window listeners, set position and focus.
		// Corresponds exactly to `componentDidMount`.
		if ( ! prevState.show && this.state.show ) {
			this.bindListeners();
			this.setPositionAndFocus();
		}

		// When hiding, unbind window listeners. Corresponds exactly to `componentWillUnmount`.
		if ( prevState.show && ! this.state.show ) {
			this.unbindListeners();
		}

		// update our position even when only our children change, use `isUpdatingPosition` to guard against a loop
		// see https://github.com/Automattic/wp-calypso/commit/38e779cfebf6dd42bb30d8be7127951b0c531ae2
		if ( prevState.show && this.state.show && ! this.isUpdatingPosition ) {
			this.isUpdatingPosition = true;
			defer( () => {
				this.setPosition();
				this.isUpdatingPosition = false;
			} );
		}
	}

	componentWillUnmount() {
		this.unbindListeners();
	}

	bindListeners() {
		this.bindClickoutHandler();
		this.bindEscKeyListener();
		this.bindReposition();
		bindWindowListeners();
	}

	unbindListeners() {
		this.unbindClickoutHandler();
		this.unbindEscKeyListener();
		this.unbindReposition();
		unbindWindowListeners();
	}

	// --- ESC key ---
	bindEscKeyListener() {
		if ( this.props.closeOnEsc ) {
			document.addEventListener( 'keydown', this.onKeydown, true );
		}
	}

	unbindEscKeyListener() {
		if ( this.props.closeOnEsc ) {
			document.removeEventListener( 'keydown', this.onKeydown, true );
		}
	}

	onKeydown = event => {
		if ( event.keyCode === 27 ) {
			const domContext = ReactDom.findDOMNode( this.props.context );
			if ( domContext ) {
				debug( 'Refocusing the previous active DOM node' );
				domContext.focus();
			}

			this.close( true );
		}
	};

	// --- click outside ---
	bindClickoutHandler() {
		document.addEventListener( 'click', this.onClickout );
	}

	unbindClickoutHandler() {
		document.removeEventListener( 'click', this.onClickout );
	}

	onClickout = event => {
		const popoverContext = this.popoverInnerNodeRef.current;
		let shouldClose = popoverContext && ! popoverContext.contains( event.target );

		if ( shouldClose && this.props.context ) {
			const domContext = ReactDom.findDOMNode( this.props.context );
			shouldClose = domContext && ! domContext.contains( event.target );
		}

		if ( shouldClose && this.props.ignoreContext ) {
			const ignoreContext = ReactDom.findDOMNode( this.props.ignoreContext );
			shouldClose = ignoreContext && ! ignoreContext.contains( event.target );
		}

		if ( shouldClose ) {
			this.close();
		}
	};

	// --- window `scroll` and `resize` ---
	bindReposition() {
		window.addEventListener( 'scroll', this.onWindowChange, true );
		window.addEventListener( 'resize', this.onWindowChange, true );
	}

	unbindReposition() {
		window.removeEventListener( 'scroll', this.onWindowChange, true );
		window.removeEventListener( 'resize', this.onWindowChange, true );
	}

	onWindowChange = () => {
		this.setPosition();
	};

	setPositionAndFocus() {
		this.setPosition();
		this.focusPopover();
	}

	focusPopover() {
		// Defer the focus a bit to make sure that the popover already has the final position.
		// Initially, after first render, the popover is positioned outside the screen, at
		// { top: -9999, left: -9999 } where it already has dimensions. These dimensions are measured
		// and used to calculate the final position.
		// Focusing the element while it's off the screen would cause unwanted scrolling.
		defer( () => {
			if ( this.popoverNodeRef.current ) {
				debug( 'focusing the popover' );
				this.popoverNodeRef.current.focus();
			}
		} );
	}

	getPositionClass( position ) {
		return `is-${ position.replace( /\s+/g, '-' ) }`;
	}

	/**
	 * Adjusts position swapping left and right values
	 * when right-to-left directionality is found.
	 *
	 * @param {string} position Original position
	 * @returns {string} Adjusted position
	 */
	adjustRtlPosition( position ) {
		if ( this.props.isRtl ) {
			switch ( position ) {
				case 'top right':
				case 'right top':
					return 'top left';

				case 'right':
					return 'left';

				case 'bottom right':
				case 'right bottom':
					return 'bottom left';

				case 'bottom left':
				case 'left bottom':
					return 'bottom right';

				case 'left':
					return 'right';

				case 'top left':
				case 'left top':
					return 'top right';
			}
		}
		return position;
	}

	/**
	 * Computes the position of the Popover in function
	 * of its main container and the target.
	 *
	 * @returns {object} reposition parameters
	 */
	computePosition() {
		const { position, relativePosition } = this.props;
		const domContainer = this.popoverInnerNodeRef.current;
		const domContext = ReactDom.findDOMNode( this.props.context );

		if ( ! domContext ) {
			debug( '[WARN] no DOM elements to work' );
			return null;
		}

		let suggestedPosition = position;
		debug( 'position: %o', suggestedPosition );

		if ( this.props.autoRtl ) {
			suggestedPosition = this.adjustRtlPosition( suggestedPosition );
			debug( 'RTL adjusted position: %o', suggestedPosition );
		}

		if ( this.props.autoPosition ) {
			suggestedPosition = suggestPosition( suggestedPosition, domContainer, domContext );
			debug( 'suggested position: %o', suggestedPosition );
		}

		const reposition = Object.assign(
			{},
			constrainLeft(
				offset( suggestedPosition, domContainer, domContext, relativePosition ),
				domContainer
			),
			{ positionClass: this.getPositionClass( suggestedPosition ) }
		);

		debug( 'updating reposition: ', reposition );

		return reposition;
	}

	setPosition = () => {
		debug( 'updating position' );

		let position;

		// Do we have a custom position provided?
		if ( this.props.customPosition ) {
			position = Object.assign(
				{
					// Use the default if positionClass hasn't been provided
					positionClass: this.getPositionClass( this.constructor.defaultProps.position ),
				},
				this.props.customPosition
			);
		} else {
			position = this.computePosition();
		}

		if ( position ) {
			this.setState( position );
		}
	};

	getStylePosition() {
		const { left, top } = this.state;
		return { left, top };
	}

	show() {
		if ( ! this.props.showDelay ) {
			this.setState( { show: true } );
			return;
		}

		debug( 'showing in %o', `${ this.props.showDelay }ms` );
		this.clearShowTimer();

		this._openDelayTimer = setTimeout( () => {
			this.setState( { show: true } );
		}, this.props.showDelay );
	}

	hide() {
		this.setState( { show: false } );
		this.clearShowTimer();
	}

	clearShowTimer() {
		if ( this._openDelayTimer ) {
			clearTimeout( this._openDelayTimer );
			this._openDelayTimer = null;
		}
	}

	close( wasCanceled = false ) {
		if ( ! this.props.isVisible ) {
			debug( 'popover should be already closed' );
			return null;
		}

		this.props.onClose( wasCanceled );
	}

	render() {
		if ( ! this.state.show ) {
			debug( 'is hidden. return no render' );
			return null;
		}

		if ( ! this.props.context ) {
			debug( 'No `context` to tie. return no render' );
			return null;
		}

		const classes = classNames( 'popover', this.props.className, this.state.positionClass );

		return (
			<div
				ref={ this.popoverNodeRef }
				aria-label={ this.props[ 'aria-label' ] }
				id={ this.props.id }
				role="tooltip"
				tabIndex="-1"
				style={ this.getStylePosition() }
				className={ classes }
			>
				<div className="popover__arrow" />
				<div ref={ this.popoverInnerNodeRef } className="popover__inner">
					{ this.props.children }
				</div>
			</div>
		);
	}
}

export default function Popover( props ) {
	const isRtl = useRtl();
	// wrapping children inside `<RootChild>` changes the timing of lifecycles and setting refs,
	// because the children are rendered inside `RootChild`'s `componentDidMount`, later than
	// usual. That's why we need this wrapper that removes `RootChild` from the inner component
	// and simplifies its complicated lifecycle logic.
	return (
		<RootChild>
			<PopoverInner { ...props } isRtl={ isRtl } />
		</RootChild>
	);
}
