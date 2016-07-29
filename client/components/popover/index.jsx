/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import debugFactory from 'debug';
import classNames from 'classnames';
import clickOutside from 'click-outside';

/**
 * Internal dependencies
 */
import RootChild from 'components/root-child';
import {
	suggested as suggestPosition,
	constrainLeft,
	offset
} from './util';

/**
 * Module variables
 */
const noop = () => {};
const debug = debugFactory( 'calypso:popover' );
const __popovers = new Set();
let __popoverNumber = 0;

class Popover extends Component {
	constructor() {
		super();

		this.setDOMBehavior = this.setDOMBehavior.bind( this );
		this.onPopoverClickout = this.onPopoverClickout.bind( this );
		this.onKeydown = this.onKeydown.bind( this );

		this.state = {
			left: -99999,
			top: -99999,
			positionClass: 'popover-top'
		};

		this.id = `pop-${__popoverNumber}`;
		__popovers.add( this.id );
		__popoverNumber++;
		debug( '[%s] init', this.id );
	}

	// - lifecycle -

	componentWillMount() {
		this.domContext = ReactDOM.findDOMNode( this.props.context );
	}

	componentDidMount() {
		this.addEscKeyListener();
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.domContainer ) {
			return null;
		}

		this.domContext = ReactDOM.findDOMNode( nextProps.context );
		this.setPosition();

		if ( nextProps.isVisible ) {
			this.setClickoutHandler();
		} else {
			this.unsetClickoutHandler();
		}
	}

	componentWillUnmount() {
		this.unsetClickoutHandler();
		this.removeEscKeyListener();
	}

	// - bound events -

	onKeydown( event ) {
		if ( event.keyCode !== 27 ) {
			return null;
		}

		this.close();
	}

	unsetClickoutHandler() {
		if ( this._unbindClickHandler ) {
			debug( '[%s] unbinding `clickout` event', this.id );
			this._unbindClickHandler();
			this._unbindClickHandler = null;
		}
	}

	addEscKeyListener() {
		if ( ! this.props.closeOnEsc ) {
			return null;
		}

		if ( this.escEventHandlerAdd ) {
			return null;
		}

		debug( '[%s] adding escKey handler ...', this.id );
		this.escEventHandlerAdd = true;
		document.addEventListener( 'keydown', this.onKeydown, true );
	}

	removeEscKeyListener() {
		if ( ! this.props.closeOnEsc ) {
			return null;
		}

		if ( ! this.escEventHandlerAdd ) {
			return null;
		}

		debug( '[%s] removing escKey handler ...', this.id );
		document.removeEventListener( 'keydown', this.onKeydown, true );
	}

	// - generic methods -

	getPositionClass( position = this.props.position ) {
		return `popover-${ position.replace( /\s+/g, '-' ) }`;
	}

	setClickoutHandler( el = this.domContainer ) {
		if ( this._unbindClickHandler ) {
			return debug( 'clickout event already bound' );
		}

		debug( '[%s] binding `clickout` event', this.id );
		this._unbindClickHandler = clickOutside( el, this.onPopoverClickout );
	}

	/**
	 * Computes the position of the Popover in function
	 * of its main container (DOM element) and the target(context)
	 *
	 * @return {Object} reposition parameters
	 */
	getReposition() {
		const { domContainer, domContext } = this;
		const { position } = this.props;

		if ( ! domContainer || ! domContext ) {
			debug( 'no DOM elements to work' );
			return null;
		}

		const suggestedPosition = suggestPosition( position, domContainer, domContext );

		debug( 'suggested position: %o', suggestedPosition );

		const reposition = Object.assign(
			{},
			constrainLeft(
				offset( suggestedPosition, domContainer, domContext ),
				domContainer
			),
			{ positionClass: this.getPositionClass( suggestedPosition ) }
		);

		debug( 'updating postion reposition: ', reposition );
		return reposition;
	}

	setPosition() {
		const position = this.getReposition();

		if ( ! position ) {
			return null;
		}

		this.setState( position );
	}

	getStylePosition() {
		return { left: this.state.left, top: this.state.top, };
	}

	setDOMBehavior( domContainer ) {
		debug( 'setting DOM behavior' );

		if ( ! domContainer ) {
			return;
		}

		// store DOM element referencies
		this.domContainer = domContainer;
		this.domContext = ReactDOM.findDOMNode( this.props.context );

		this.setPosition();
		this.setClickoutHandler( domContainer );
	}

	onPopoverClickout() {
		this.close();
	}

	close() {
		if ( ! this.props.isVisible ) {
			debug( 'popover should be already closed' );
			return null;
		}

		this.props.onClose();
	}

	render() {
		const { isVisible, context } = this.props;

		if ( ! isVisible ) {
			debug( 'Popover is not visible.' );
			return null;
		}

		if ( ! context ) {
			debug( '`context` is not defined.' );
			return null;
		}

		const classes = classNames(
			'popover__container',
			this.state.positionClass
		);

		debug( 'rendering ...' );

		// React supports a special attribute that you can attach to any component.
		// The ref attribute can be a callback function, and this callback will be
		// executed immediately after the component is mounted.
		return (
			<RootChild>
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

Popover.propTypes = {
	className: PropTypes.string,
	closeOnEsc: PropTypes.bool,
	group: PropTypes.string,
	position: PropTypes.string,

	onClose: PropTypes.func.isRequired,
	onShow: PropTypes.func,
};

Popover.defaultProps = {
	className: 'popover',
	closeOnEsc: true,
	position: 'top',
	isVisible: false,
	onShow: noop,
};

export default Popover;
