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

		this.setContainerElement = this.setContainerElement.bind( this );
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

	componentDidMount() {
		this.addEscKeyListener();
	}

	componentWillUnmount() {
		this.unsetClickoutHandler();
		this.removeEscKeyListener();
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.domContainer ) {
			return null;
		}

		this.setState( {
			positionClass: this.getPositionClass( 'top' )
		} );

		if ( nextProps.isVisible ) {
			this.setClickoutHandler();
		} else {
			this.unsetClickoutHandler();
		}
	}

	onKeydown( event ) {
		if ( event.keyCode !== 27 ) {
			return null;
		}

		this.close();
	}

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

	reposition( domContainer ) {
		const { context, position } = this.props;

		if ( ! domContainer || ! context ) {
			return null;
		}

		const domTarget = ReactDOM.findDOMNode( context );
		const suggestedPosition = suggestPosition( position, domContainer, domTarget );

		debug( 'suggested position: %o', suggestedPosition );

		const state = Object.assign(
			{},
			constrainLeft(
				offset( suggestedPosition, domContainer, domTarget ),
				domContainer
			),
			{ positionClass: this.getPositionClass( suggestedPosition ) }
		);

		debug( 'updating postion state: ', state );
		this.setState( state );
	}

	getStylePosition() {
		return { left: this.state.left, top: this.state.top, };
	}

	setContainerElement( el ) {
		if ( ! el ) {
			return;
		}

		this.domContainer = el;
		this.reposition( el );
		this.setClickoutHandler( el );
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

		return (
			<RootChild>
				<div
					style={ this.getStylePosition() }
					className={ classes }
					ref={ this.setContainerElement }
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
