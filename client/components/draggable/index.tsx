/**
 * External dependencies
 */
import React, { Component, CSSProperties, TouchEventHandler, MouseEventHandler } from 'react';

interface Props {
	onDrag: ( x: number, y: number ) => void;
	onStop: () => void;
	width: number;
	height: number;
	x: number;
	y: number;
	controlled: boolean;
	bounds: {
		top: number;
		left: number;
		bottom: number;
		right: number;
	} | null;
}

interface State {
	x: number;
	y: number;
}

export default class Draggable extends Component< Props, State > {
	static defaultProps: Props = {
		onDrag: () => {},
		onStop: () => {},
		width: 0,
		height: 0,
		x: 0,
		y: 0,
		controlled: false,
		bounds: null,
	};

	state: State = {
		x: this.props.x,
		y: this.props.y,
	};

	dragging: boolean = false;
	frameRequestId: ReturnType< typeof requestAnimationFrame > | null = null;
	relativePos?: { x: number; y: number };
	mousePos: { x: number; y: number } | null = null;

	componentWillReceiveProps( newProps: Props ) {
		if ( this.state.x !== newProps.x || this.state.y !== newProps.y ) {
			this.setState( {
				x: newProps.x,
				y: newProps.y,
			} );
		}
	}

	componentWillUnmount() {
		this.cancelRaf();
		this.removeListeners();
	}

	cancelRaf() {
		if ( this.frameRequestId ) {
			cancelAnimationFrame( this.frameRequestId );
			this.frameRequestId = null;
		}
	}

	draggingStartedHandler = (
		event: React.TouchEvent< HTMLDivElement > | React.MouseEvent< HTMLDivElement >
	) => {
		this.dragging = true;

		const coords = this.isTouchEvent( event ) ? event.touches[ 0 ] : event;

		this.relativePos = {
			x: coords.pageX - this.state.x,
			y: coords.pageY - this.state.y,
		};

		this.cancelRaf();
		this.frameRequestId = requestAnimationFrame( this.update );
	};

	isTouchEvent( event: React.TouchEvent | React.MouseEvent ): event is React.TouchEvent {
		return (
			( ! ( event as React.MouseEvent ).pageX || ! ( event as React.MouseEvent ).pageY ) &&
			!! (
				( event as React.TouchEvent ).targetTouches &&
				( event as React.TouchEvent ).targetTouches.length
			)
		);
	}

	draggingHandler = ( event: TouchEvent | MouseEvent ) => {
		const coords = this.isTouchEvent( event ) ? event.touches[ 0 ] : event;

		const x = coords.pageX - this.relativePos.x,
			y = coords.pageY - this.relativePos.y;

		this.mousePos = { x, y };
	};

	draggingEndedHandler = () => {
		this.dragging = false;
		this.mousePos = null;

		this.cancelRaf();

		this.removeListeners();

		this.props.onStop();
	};

	onTouchStartHandler: TouchEventHandler< HTMLDivElement > = event => {
		event.preventDefault();

		document.addEventListener( 'touchmove', this.draggingHandler );
		document.addEventListener( 'touchend', this.draggingEndedHandler );
	};

	onMouseDownHandler: MouseEventHandler< HTMLDivElement > = event => {
		event.preventDefault();

		document.addEventListener( 'mousemove', this.draggingHandler );
		document.addEventListener( 'mouseup', this.draggingEndedHandler );

		this.draggingStartedHandler( event );
	};

	update = () => {
		if ( ! this.mousePos ) {
			this.frameRequestId = requestAnimationFrame( this.update );
			return;
		}

		const { bounds } = this.props;
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
	};

	removeListeners() {
		document.removeEventListener( 'mousemove', this.draggingHandler );
		document.removeEventListener( 'mouseup', this.draggingEndedHandler );
		document.removeEventListener( 'touchmove', this.draggingHandler );
		document.removeEventListener( 'touchend', this.draggingEndedHandler );
	}

	render() {
		const { onDrag, onStop, width, height, x, y, controlled, bounds, ...elementProps } = this.props;
		const style: CSSProperties = {
			transform: 'translate(' + this.state.x + 'px, ' + this.state.y + 'px)',
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
			/>
		);
	}
}
