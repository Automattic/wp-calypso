/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { noop, omit } from 'lodash';

export default class Draggable extends Component {
	static propTypes = {
		onDrag: PropTypes.func,
		onStop: PropTypes.func,
		width: PropTypes.number,
		height: PropTypes.number,
		x: PropTypes.number,
		y: PropTypes.number,
		controlled: PropTypes.bool,
		bounds: PropTypes.shape( {
			top: PropTypes.number,
			left: PropTypes.number,
			bottom: PropTypes.number,
			right: PropTypes.number
		} )
	};

	static defaultProps = {
		onDrag: noop,
		onStop: noop,
		width: 0,
		height: 0,
		x: 0,
		y: 0,
		controlled: false,
		bounds: null
	};

	constructor( props ) {
		super( props );

		this.state = {
			x: this.props.x,
			y: this.props.y
		};

		this.onTouchStartHandler = this.onTouchStartHandler.bind( this );
		this.onMouseDownHandler = this.onMouseDownHandler.bind( this );

		this.draggingHandler = this.draggingHandler.bind( this );
		this.draggingEndedHandler = this.draggingEndedHandler.bind( this );

		this.update = this.update.bind( this );
	}

	componentWillReceiveProps( newProps ) {
		if ( this.state.x !== newProps.x || this.state.y !== newProps.y ) {
			this.setState( {
				x: newProps.x,
				y: newProps.y
			} );
		}
	}

	componentWillUnmount() {
		this.removeListeners();
	}

	draggingStartedHandler( event ) {
		this.dragging = true;

		let coords = event;

		if ( this.isTouchEvent( event ) ) {
			coords = event.touches[ 0 ];
		}

		this.relativePos = {
			x: coords.pageX - this.state.x,
			y: coords.pageY - this.state.y
		};

		cancelAnimationFrame( this.frameRequestId );
		this.frameRequestId = requestAnimationFrame( this.update );
	}

	isTouchEvent( event ) {
		return (
			( ! event.pageX || ! event.pageY ) &&
			( event.targetTouches && event.targetTouches.length )
		);
	}

	draggingHandler( event ) {
		let coords = event;

		if ( this.isTouchEvent( event ) ) {
			coords = event.touches[ 0 ];
		}

		const x = coords.pageX - this.relativePos.x,
			y = coords.pageY - this.relativePos.y;

		this.mousePos = { x, y };
	}

	draggingEndedHandler( ) {
		this.dragging = false;
		this.mousePos = null;

		cancelAnimationFrame( this.frameRequestId );

		this.removeListeners();

		this.props.onStop();
	}

	onTouchStartHandler( event ) {
		event.preventDefault();

		document.addEventListener( 'touchmove', this.draggingHandler );
		document.addEventListener( 'touchend', this.draggingEndedHandler );

		this.draggingStartedHandler( event );
	}

	onMouseDownHandler( event ) {
		event.preventDefault();

		document.addEventListener( 'mousemove', this.draggingHandler );
		document.addEventListener( 'mouseup', this.draggingEndedHandler );

		this.draggingStartedHandler( event );
	}

	update() {
		if ( ! this.mousePos ) {
			this.frameRequestId = requestAnimationFrame( this.update );
			return;
		}

		const bounds = this.props.bounds;
		let { x, y } = this.mousePos;
		if ( bounds ) {
			x = Math.max( bounds.left, Math.min( bounds.right - this.props.width, x ) );
			y = Math.max( bounds.top, Math.min( bounds.bottom - this.props.height, y ) );
		}

		if ( this.dragging ) {
			this.frameRequestId = requestAnimationFrame( this.update );
		}

		this.props.onDrag( x, y );

		if ( this.props.controlled ) {
			return;
		}

		this.setState( { x, y } );
	}

	removeListeners() {
		document.removeEventListener( 'mousemove', this.draggingHandler );
		document.removeEventListener( 'mouseup', this.draggingEndedHandler );

		document.removeEventListener( 'touchmove', this.draggingHandler );
		document.removeEventListener( 'touchend', this.draggingEndedHandler );
	}

	render() {
		const elementProps = omit( this.props, Object.keys( this.constructor.propTypes ) ),
			style = {
				transform: 'translate(' + this.state.x + 'px, ' + this.state.y + 'px)'
			};

		if ( this.props.width || this.props.height ) {
			style.width = this.props.width + 'px';
			style.height = this.props.height + 'px';
		}

		return (
			<div
				{ ...elementProps }
				style={ style }
				onMouseDown={ this.onMouseDownHandler }
				onTouchStart={ this.onTouchStartHandler }
			>
			</div>
		);
	}
}
