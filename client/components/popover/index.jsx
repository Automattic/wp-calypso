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

class PopoverInner extends Component {
	static defaultProps = {
		autoPosition: true,
		autoRtl: true,
		className: '',
		closeOnEsc: true,
		isRtl: false,
		position: 'top',
		onClose: noop,
	};

	/**
	 * Timeout ID that determines if repositioning the Popover is currently scheduled and lets us
	 * cancel the task.
	 *
	 * @type {number|null} `setTimeout` handle or null
	 */
	scheduledPositionUpdate = null;

	/**
	 * Timeout ID for the scheduled focus. Lets us cancel the task when hiding/unmounting.
	 *
	 * @type {number|null} `setTimeout` handle or null
	 */
	scheduledFocus = null;

	popoverNodeRef = React.createRef();
	popoverInnerNodeRef = React.createRef();

	state = {
		left: -99999,
		top: -99999,
		positionClass: this.getPositionClass( this.props.position ),
	};

	componentDidMount() {
		this.bindListeners();
		this.setPositionAndFocus();
	}

	componentDidUpdate() {
		// Update our position even when only our children change. To prevent infinite loops,
		// use `defer` and avoid scheduling a second update when one is already scheduled by
		// setting and checking `this.scheduledPositionUpdate`.
		// See https://github.com/Automattic/wp-calypso/commit/38e779cfebf6dd42bb30d8be7127951b0c531ae2
		if ( this.scheduledPositionUpdate == null ) {
			this.scheduledPositionUpdate = defer( () => {
				this.setPosition();
				this.scheduledPositionUpdate = null;
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

		// cancel the scheduled reposition when the Popover is being removed from DOM
		if ( this.scheduledPositionUpdate != null ) {
			window.clearTimeout( this.scheduledPositionUpdate );
			this.scheduledPositionUpdate = null;
		}

		// cancel the scheduled focus when we're hiding the Popover before the task had a chance to run
		if ( this.scheduledFocus != null ) {
			window.clearTimeout( this.scheduledFocus );
			this.scheduledFocus = null;
		}
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

	onKeydown = ( event ) => {
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
		// run the listener in the capture phase, to run before the React click handler that
		// runs in the bubble phase. Sometimes, the React UI handler for a click closes its
		// UI element and removes the event target from DOM. Running the clickout handler after
		// that would fail to evaluate correctly if the `event.target` (already removed from DOM)
		// is a DOM child of the popover's DOM element.
		document.addEventListener( 'click', this.onClickout, true );
	}

	unbindClickoutHandler() {
		document.removeEventListener( 'click', this.onClickout, true );
	}

	onClickout = ( event ) => {
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
		this.scheduledFocus = defer( () => {
			if ( this.popoverNodeRef.current ) {
				debug( 'focusing the popover' );
				this.popoverNodeRef.current.focus();
			}
			this.scheduledFocus = null;
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

	close( wasCanceled = false ) {
		this.props.onClose( wasCanceled );
	}

	render() {
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

// Wrapping children inside `<RootChild>` changes the timing of lifecycles and setting refs,
// because the children are rendered inside `RootChild`'s `componentDidMount`, later than
// usual. That's why we need this wrapper that removes `RootChild` from the inner component
// and simplifies its complicated lifecycle logic.
//
// We also use the outer component to manage the `show` state that can be delayed behind
// the outer `isVisible` prop by the `showDelay` timeout. One consequence is that the `RootChild`
// is created on show and destroyed on hide, making sure that the last shown popover will be
// also the last DOM element inside `document.body`, ensuring that it has a higher z-index.
function Popover( { isVisible = false, showDelay = 0, ...props } ) {
	const isRtl = useRtl();
	const [ show, setShow ] = React.useState( isVisible );

	// If `showDelay` is non-zero, the hide -> show transition will be delayed and will not
	// happen immediately after the new value of `isVisible` is received.
	React.useEffect( () => {
		if ( showDelay > 0 && show !== isVisible && isVisible ) {
			debug( `showing in ${ showDelay } ms` );
			const showDelayTimer = setTimeout( () => {
				setShow( true );
			}, showDelay );

			return () => {
				clearTimeout( showDelayTimer );
			};
		}
	}, [ showDelay, isVisible, show ] );

	// sync the `isVisible` flag to `show` state immediately, unless it's a hide -> show transition
	// and `showDelay` is non-zero. In that case, the hide -> show transition will be delayed by
	// the `useEffect` hook.
	if ( show !== isVisible && ( showDelay === 0 || ! isVisible ) ) {
		setShow( isVisible );
	}

	if ( ! show ) {
		debug( 'is hidden. return no render' );
		return null;
	}

	return (
		<RootChild>
			<PopoverInner { ...props } isRtl={ isRtl } />
		</RootChild>
	);
}

// We accept DOM elements and React component instances as the `context` prop.
// In case of a React component instance, we'll find the DOM element with `findDOMNode`.
const PropTypeElement = PropTypes.oneOfType( [
	PropTypes.instanceOf( Component ),
	PropTypes.instanceOf( typeof window !== 'undefined' ? window.Element : Object ),
] );

Popover.propTypes = {
	autoPosition: PropTypes.bool,
	autoRtl: PropTypes.bool,
	className: PropTypes.string,
	closeOnEsc: PropTypes.bool,
	id: PropTypes.string,
	context: PropTypeElement,
	ignoreContext: PropTypeElement,
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
	relativePosition: PropTypes.shape( { left: PropTypes.number } ),
	// Bypass position calculations and provide custom position values
	customPosition: PropTypes.shape( {
		top: PropTypes.number,
		left: PropTypes.number,
		positionClass: PropTypes.oneOf( [ 'top', 'right', 'bottom', 'left' ] ),
	} ),
};

export default Popover;
