/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import ReactDom from 'react-dom';
import debugFactory from 'debug';
import classNames from 'classnames';
import wrapWithClickOutside from 'react-click-outside';
import uid from 'component-uid';

/**
 * Internal dependencies
 */
import RootChild from 'components/root-child';
import {
	bindWindowListeners,
	unbindWindowListeners,

	suggested as suggestPosition,
	constrainLeft,
	isElement as isDOMElement,
	offset
} from './util';

/**
 * Module variables
 */
const noop = () => {};
const debug = debugFactory( 'calypso:popover' );
const __popovers = new Set();

class Popover extends Component {
	static propTypes = {
		autoPosition: PropTypes.bool,
		className: PropTypes.string,
		closeOnEsc: PropTypes.bool,
		id: PropTypes.string,
		ignoreContext: PropTypes.shape( { getDOMNode: React.PropTypes.function } ),
		isVisible: PropTypes.bool,
		position: PropTypes.string,
		rootClassName: PropTypes.string,
		showDelay: PropTypes.number,
		onClose: PropTypes.func,
		onShow: PropTypes.func,
	};

	static defaultProps = {
		autoPosition: true,
		className: '',
		closeOnEsc: true,
		isVisible: false,
		position: 'top',
		showDelay: 0,
		onClose: noop,
		onShow: noop,
	}

	constructor( props ) {
		super( props );

		this.setPopoverId( props.id );

		// bound methods
		this.setDOMBehavior = this.setDOMBehavior.bind( this );
		this.setPosition = this.setPosition.bind( this );
		this.onKeydown = this.onKeydown.bind( this );
		this.onWindowChange = this.onWindowChange.bind( this );

		this.state = {
			show: props.isVisible,
			left: -99999,
			top: -99999,
			positionClass: this.getPositionClass( props.position )
		};
	}

	componentDidMount() {
		this.bindEscKeyListener();
		this.bindDebouncedReposition();
		bindWindowListeners();
	}

	componentWillReceiveProps( nextProps ) {
		// update context (target) reference into a property
		if ( ! isDOMElement( nextProps.context ) ) {
			this.domContext = ReactDom.findDOMNode( nextProps.context );
		} else {
			this.domContext = nextProps.context;
		}

		if ( ! nextProps.isVisible ) {
			return null;
		}

		this.setPosition();
	}

	componentDidUpdate( prevProps ) {
		const { isVisible } = this.props;

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

		if ( ! isVisible || isVisible === prevProps.isVisible ) {
			return null;
		}

		this.debug( 'Update position after inject DOM' );
		this.setPosition();
	}

	componentWillUnmount() {
		this.debug( 'unmounting .... ' );
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

		if ( this.escEventHandlerAdded ) {
			return null;
		}

		this.debug( 'adding escKey listener ...' );
		this.escEventHandlerAdded = true;
		document.addEventListener( 'keydown', this.onKeydown, true );
	}

	unbindEscKeyListener() {
		if ( ! this.props.closeOnEsc ) {
			return null;
		}

		if ( ! this.escEventHandlerAdded ) {
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

	handleClickOutside( event ) {
		let shouldClose = (
			this.domContext &&
			this.domContext.contains &&
			! this.domContext.contains( event.target )
		);

		if ( this.props.ignoreContext && shouldClose ) {
			const ignoreContext = ReactDom.findDOMNode( this.props.ignoreContext );
			shouldClose = shouldClose && (
				ignoreContext &&
				ignoreContext.contains &&
				! ignoreContext.contains( event.target )
			);
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
			return null;
		}

		this.debug( 'setting DOM behavior' );

		// store DOM element referencies
		this.domContainer = domContainer;

		// store context (target) reference into a property
		if ( ! isDOMElement( this.props.context ) ) {
			this.domContext = ReactDom.findDOMNode( this.props.context );
		} else {
			this.domContext = this.props.context;
		}

		this.setPosition();
	}

	getPositionClass( position = this.props.position ) {
		return `is-${ position.replace( /\s+/g, '-' ) }`;
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
		const { position } = this.props;

		if ( ! domContainer || ! domContext ) {
			this.debug( '[WARN] no DOM elements to work' );
			return null;
		}

		let suggestedPosition = position;

		this.debug( 'position: %o', position );

		if ( this.props.autoPosition ) {
			suggestedPosition = suggestPosition( position, domContainer, domContext );
			this.debug( 'suggested position: %o', suggestedPosition );
		}

		const reposition = Object.assign(
			{},
			constrainLeft(
				offset( suggestedPosition, domContainer, domContext ),
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
		this.id = id || `pop__${ uid( 16 ) }`;
		__popovers.add( this.id );

		this.debug( 'creating ...' );
		debug( 'current popover instances: ', __popovers.size );
	}

	setPosition() {
		const position = this.computePosition();
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

		const classes = classNames(
			'popover',
			this.props.className,
			this.state.positionClass
		);

		this.debug( 'rendering ...' );

		return (
			<RootChild className={ this.props.rootClassName }>
				<div
					style={ this.getStylePosition() }
					className={ classes }
					ref={ this.setDOMBehavior }
				>
					<div className="popover__arrow" />

					<div className="popover__inner">
						{ this.props.children }
					</div>
				</div>
			</RootChild>
		);
	}
}

export default wrapWithClickOutside( Popover );
