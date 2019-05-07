/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import classNames from 'classnames';
import clickOutside from 'click-outside';
import { uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import RootChild from 'components/root-child';
import {
	bindWindowListeners,
	unbindWindowListeners,
	suggested as suggestPosition,
	constrainLeft,
	offset,
} from './util';
import isRtlSelector from 'state/selectors/is-rtl';

/**
 * Module variables
 */
const noop = () => {};
const debug = debugFactory( 'calypso:popover' );
const __popovers = new Set();

class Popover extends Component {
	static propTypes = {
		autoPosition: PropTypes.bool,
		autoRtl: PropTypes.bool,
		className: PropTypes.string,
		closeOnEsc: PropTypes.bool,
		id: PropTypes.string,
		ignoreContext: PropTypes.shape( { getDOMNode: PropTypes.function } ),
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
	 * @type {boolean} True if the Popover is being repositioned.
	 */
	isUpdatingPosition = false;

	constructor( props ) {
		super( props );

		this.setPopoverId( props.id );

		// bound methods
		this.setDOMBehavior = this.setDOMBehavior.bind( this );
		this.setPosition = this.setPosition.bind( this );
		this.onClickout = this.onClickout.bind( this );
		this.onKeydown = this.onKeydown.bind( this );
		this.onWindowChange = this.onWindowChange.bind( this );

		this.state = {
			show: props.isVisible,
			left: -99999,
			top: -99999,
			positionClass: this.getPositionClass( props.position ),
		};
	}

	componentDidMount() {
		if ( this.state.show ) {
			this.bindEscKeyListener();
			this.bindDebouncedReposition();
			bindWindowListeners();
		}
	}

	componentWillReceiveProps( nextProps ) {
		// update context (target) reference into a property
		this.domContext = ReactDom.findDOMNode( nextProps.context );

		if ( ! nextProps.isVisible ) {
			return null;
		}

		this.setPosition();
	}

	componentDidUpdate( prevProps, prevState ) {
		const { isVisible } = this.props;

		if ( ! prevState.show && this.state.show ) {
			this.bindEscKeyListener();
			this.bindDebouncedReposition();
			bindWindowListeners();
		}

		if ( isVisible !== prevProps.isVisible ) {
			if ( isVisible ) {
				this.show();
			} else {
				this.hide();
			}
		}

		if ( ! this.domContainer || ! this.domContext ) {
			return null;
		}

		if ( ! isVisible ) {
			return null;
		}

		if ( ! this.isUpdatingPosition ) {
			// update our position even when only our children change, use `isUpdatingPosition` to guard against a loop
			// see https://github.com/Automattic/wp-calypso/commit/38e779cfebf6dd42bb30d8be7127951b0c531ae2
			this.debug( 'requesting to update position after render completes' );
			requestAnimationFrame( () => {
				// Prevent updating Popover position if it's already unmounted.
				if (
					! __popovers.has( this.id ) ||
					! this.domContainer ||
					! this.domContext ||
					! isVisible
				) {
					this.isUpdatingPosition = false;
					return;
				}

				this.setPosition();
				this.isUpdatingPosition = false;
			} );
			this.isUpdatingPosition = true;
		}
	}

	componentWillUnmount() {
		this.debug( 'unmounting .... ' );

		this.unbindClickoutHandler();
		this.unbindDebouncedReposition();
		this.unbindEscKeyListener();
		unbindWindowListeners();

		__popovers.delete( this.id );
		debug( 'current popover instances: ', __popovers.size );
	}

	// --- ESC key ---
	bindEscKeyListener() {
		if ( ! this.props.closeOnEsc ) {
			return null;
		}

		this.debug( 'adding escKey listener ...' );
		document.addEventListener( 'keydown', this.onKeydown, true );
	}

	unbindEscKeyListener() {
		if ( ! this.props.closeOnEsc ) {
			return null;
		}

		this.debug( 'unbinding `escKey` listener ...' );
		document.removeEventListener( 'keydown', this.onKeydown, true );
	}

	onKeydown( event ) {
		if ( event.keyCode !== 27 ) {
			return null;
		}

		this.close( true );
	}

	// --- click outside ---
	bindClickoutHandler( el = this.domContainer ) {
		if ( ! el ) {
			this.debug( 'no element to bind clickout ' );
			return null;
		}

		if ( this._clickoutHandlerReference ) {
			this.debug( 'clickout event already bound' );
			return null;
		}

		this.debug( 'binding `clickout` event' );
		this._clickoutHandlerReference = clickOutside( el, this.onClickout );
	}

	unbindClickoutHandler() {
		if ( this._clickoutHandlerReference ) {
			this.debug( 'unbinding `clickout` listener ...' );
			this._clickoutHandlerReference();
			this._clickoutHandlerReference = null;
		}
	}

	onClickout( event ) {
		let shouldClose =
			this.domContext && this.domContext.contains && ! this.domContext.contains( event.target );

		if ( this.props.ignoreContext && shouldClose ) {
			const ignoreContext = ReactDom.findDOMNode( this.props.ignoreContext );
			shouldClose =
				shouldClose &&
				( ignoreContext && ignoreContext.contains && ! ignoreContext.contains( event.target ) );
		}

		if ( shouldClose ) {
			this.close();
		}
	}

	// --- window `scroll` and `resize` ---
	bindDebouncedReposition() {
		window.addEventListener( 'scroll', this.onWindowChange, true );
		window.addEventListener( 'resize', this.onWindowChange, true );
	}

	unbindDebouncedReposition() {
		if ( this.willReposition ) {
			window.cancelAnimationFrame( this.willReposition );
			this.willReposition = null;
		}

		window.removeEventListener( 'scroll', this.onWindowChange, true );
		window.removeEventListener( 'resize', this.onWindowChange, true );
		this.debug( 'unbinding `debounce reposition` ...' );
	}

	onWindowChange() {
		this.willReposition = window.requestAnimationFrame( this.setPosition );
	}

	setDOMBehavior( domContainer ) {
		if ( ! domContainer ) {
			this.unbindClickoutHandler();
			return null;
		}

		this.debug( 'setting DOM behavior' );

		this.bindClickoutHandler( domContainer );

		// store DOM element referencies
		this.domContainer = domContainer;

		// store context (target) reference into a property
		this.domContext = ReactDom.findDOMNode( this.props.context );

		this.setPosition();
	}

	getPositionClass( position = this.props.position ) {
		return `is-${ position.replace( /\s+/g, '-' ) }`;
	}

	/**
	 * Adjusts position swapping left and right values
	 * when right-to-left directionality is found.
	 *
	 * @param  {String} position Original position
	 * @return {String}          Adjusted position
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
	 * @return {Object} reposition parameters
	 */
	computePosition() {
		if ( ! this.props.isVisible ) {
			return null;
		}

		const { domContainer, domContext } = this;
		const { position, relativePosition } = this.props;

		if ( ! domContainer || ! domContext ) {
			this.debug( '[WARN] no DOM elements to work' );
			return null;
		}

		let suggestedPosition = position;
		this.debug( 'position: %o', suggestedPosition );

		if ( this.props.autoRtl ) {
			suggestedPosition = this.adjustRtlPosition( suggestedPosition );
			this.debug( 'RTL adjusted position: %o', suggestedPosition );
		}

		if ( this.props.autoPosition ) {
			suggestedPosition = suggestPosition( suggestedPosition, domContainer, domContext );
			this.debug( 'suggested position: %o', suggestedPosition );
		}

		const reposition = Object.assign(
			{},
			constrainLeft(
				offset( suggestedPosition, domContainer, domContext, relativePosition ),
				domContainer
			),
			{ positionClass: this.getPositionClass( suggestedPosition ) }
		);

		this.debug( 'updating reposition: ', reposition );

		return reposition;
	}

	debug( string, ...args ) {
		debug( `[%s] ${ string }`, this.id, ...args );
	}

	setPopoverId( id ) {
		this.id = id || `pop__${ uniqueId() }`;
		__popovers.add( this.id );

		this.debug( 'creating ...' );
		debug( 'current popover instances: ', __popovers.size );
	}

	setPosition() {
		this.debug( 'updating position' );

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

		if ( ! position ) {
			return null;
		}

		this.willReposition = null;
		this.setState( position );
	}

	getStylePosition() {
		const { left, top } = this.state;
		return { left, top };
	}

	show() {
		if ( ! this.props.showDelay ) {
			this.setState( { show: true } );
			return null;
		}

		this.debug( 'showing in %o', `${ this.props.showDelay }ms` );
		this.clearShowTimer();

		this._openDelayTimer = setTimeout( () => {
			this.setState( { show: true } );
		}, this.props.showDelay );
	}

	hide() {
		// unbind click outside event every time the component is hidden.
		this.unbindClickoutHandler();
		this.unbindDebouncedReposition();
		this.unbindEscKeyListener();
		unbindWindowListeners();

		this.setState( { show: false } );
		this.clearShowTimer();
	}

	clearShowTimer() {
		if ( ! this._openDelayTimer ) {
			return null;
		}

		clearTimeout( this._openDelayTimer );
		this._openDelayTimer = null;
	}

	close( wasCanceled = false ) {
		if ( ! this.props.isVisible ) {
			this.debug( 'popover should be already closed' );
			return null;
		}

		this.props.onClose( wasCanceled );
	}

	render() {
		if ( ! this.state.show ) {
			this.debug( 'is hidden. return no render' );
			return null;
		}

		if ( ! this.props.context ) {
			this.debug( 'No `context` to tie. return no render' );
			return null;
		}

		const classes = classNames( 'popover', this.props.className, this.state.positionClass );

		this.debug( 'rendering ...' );

		return (
			<RootChild>
				<div style={ this.getStylePosition() } className={ classes }>
					<div className="popover__arrow" />

					<div ref={ this.setDOMBehavior } className="popover__inner">
						{ this.props.children }
					</div>
				</div>
			</RootChild>
		);
	}
}

export default connect( state => ( {
	isRtl: isRtlSelector( state ),
} ) )( Popover );
