/**
 * External dependencies
 */
import React, { Component } from 'react';

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

/**
 * Some minimal interfaces that allow handling of synthetic React events and native DOM events.
 */

interface MinimalTouchList {
	readonly length: number;
	[ index: number ]: HasPageCoords;
}
interface HasTouches {
	readonly touches: MinimalTouchList;
}
interface HasPageCoords {
	readonly pageX: number;
	readonly pageY: number;
}

/**
 * Discriminate between Mouse and Touch types of events.
 *
 * @param event Event (Mouse or Touch)
 * @returns      True if the event has touches
 */
function isEventWithTouches( event: HasTouches | HasPageCoords ): event is HasTouches {
	return (
		( ! ( event as HasPageCoords ).pageX || ! ( event as HasPageCoords ).pageY ) &&
		!! ( ( event as HasTouches ).touches && ( event as HasTouches ).touches.length )
	);
}

type DivProps = Omit<
	React.ComponentPropsWithoutRef< 'div' >,
	'style' | 'onMouseDown' | 'onTouchStart'
>;

export default class Draggable extends Component< Props & DivProps, State > {
	static defaultProps = {
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
	relativePos: { x: number; y: number } | null = null;
	mousePos: { x: number; y: number } | null = null;

	static getDerivedStateFromProps( props: Draggable[ 'props' ], state: State ) {
		if ( state.x !== props.x || state.y !== props.y ) {
			return {
				x: props.x,
				y: props.y,
			};
		}
		return null;
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

		const coords = isEventWithTouches( event ) ? event.touches[ 0 ] : event;

		this.relativePos = {
			x: coords.pageX - this.state.x,
			y: coords.pageY - this.state.y,
		};

		this.cancelRaf();
		this.frameRequestId = requestAnimationFrame( this.update );
	};

	draggingHandler = ( event: TouchEvent | MouseEvent ) => {
		const coords = isEventWithTouches( event ) ? event.touches[ 0 ] : event;

		// draggingStartedHandler populates `relativePos` and it should not be undefined.
		const x = coords.pageX - ( this.relativePos as NonNullable< Draggable[ 'relativePos' ] > ).x;
		const y = coords.pageY - ( this.relativePos as NonNullable< Draggable[ 'relativePos' ] > ).y;

		this.mousePos = { x, y };
	};

	draggingEndedHandler = () => {
		this.dragging = false;
		this.mousePos = null;
		this.relativePos = null;

		this.cancelRaf();
		this.removeListeners();
		this.props.onStop();
	};

	onTouchStartHandler: React.TouchEventHandler< HTMLDivElement > = ( event ) => {
		event.preventDefault();

		// Call draggingStartedHandler first
		this.draggingStartedHandler( event );
		document.addEventListener( 'touchmove', this.draggingHandler );
		document.addEventListener( 'touchend', this.draggingEndedHandler );
	};

	onMouseDownHandler: React.MouseEventHandler< HTMLDivElement > = ( event ) => {
		event.preventDefault();

		// Call draggingStartedHandler first
		this.draggingStartedHandler( event );
		document.addEventListener( 'mousemove', this.draggingHandler );
		document.addEventListener( 'mouseup', this.draggingEndedHandler );
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
		// Discard "our" props and leave divProps for the div
		const { onDrag, onStop, width, height, x, y, controlled, bounds, ...divProps } = this.props;
		const style: React.CSSProperties = {
			transform: 'translate(' + this.state.x + 'px, ' + this.state.y + 'px)',
		};

		if ( this.props.width || this.props.height ) {
			style.width = this.props.width + 'px';
			style.height = this.props.height + 'px';
		}

		return (
			// eslint-disable-next-line jsx-a11y/no-static-element-interactions
			<div
				{ ...divProps }
				style={ style }
				onMouseDown={ this.onMouseDownHandler }
				onTouchStart={ this.onTouchStartHandler }
			/>
		);
	}
}
