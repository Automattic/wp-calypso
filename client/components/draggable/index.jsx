/**
 * External dependencies
 */
import React from 'react';
import noop from 'lodash/noop';
import omit from 'lodash/omit';

export default React.createClass( {
	displayName: 'Draggable',

	propTypes: {
		onDrag: React.PropTypes.func,
		onStop: React.PropTypes.func,
		width: React.PropTypes.number,
		height: React.PropTypes.number,
		x: React.PropTypes.number,
		y: React.PropTypes.number,
		controlled: React.PropTypes.bool,
		bounds: React.PropTypes.shape( {
			top: React.PropTypes.number,
			left: React.PropTypes.number,
			bottom: React.PropTypes.number,
			right: React.PropTypes.number
		} )
	},

	getDefaultProps() {
		return {
			onDrag: noop,
			onStop: noop,
			width: 0,
			height: 0,
			x: 0,
			y: 0,
			controlled: false,
			bounds: null
		};
	},

	getInitialState() {
		return {
			x: this.props.x,
			y: this.props.y
		};
	},

	componentWillReceiveProps( newProps ) {
		if ( this.state.x !== newProps.x || this.state.y !== newProps.y ) {
			this.setState( {
				x: newProps.x,
				y: newProps.y
			} );
		}
	},

	componentWillUnmount() {
		this.removeListeners();
	},

	draggingStarted( event ) {
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
	},

	isTouchEvent( event ) {
		return (
			( ! event.pageX || ! event.pageY ) &&
			( event.targetTouches && event.targetTouches.length )
		);
	},

	dragging( event ) {
		let coords = event;

		console.log('on dragging');

		if ( this.isTouchEvent( event ) ) {
			coords = event.touches[ 0 ];
		}

		const x = coords.pageX - this.relativePos.x,
			y = coords.pageY - this.relativePos.y;

		this.mousePos = { x, y };
	},

	draggingEnded( ) {
		this.dragging = false;
		this.mousePos = null;

		console.log('on dragging end');

		cancelAnimationFrame( this.frameRequestId );

		this.removeListeners();

		this.props.onStop();
	},

	onTouchStart( event ) {
		event.preventDefault();

		console.log('on touch start');

		document.addEventListener( 'touchmove', this.dragging );
		document.addEventListener( 'touchend', this.draggingEnded );

		this.draggingStarted( event );
	},

	onMouseDown( event ) {
		event.preventDefault();

		console.log('on mouse down');

		document.addEventListener( 'mousemove', this.dragging );
		document.addEventListener( 'mouseup', this.draggingEnded );

		this.draggingStarted( event );
	},

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
	},

	removeListeners() {
		document.removeEventListener( 'mousemove', this.dragging );
		document.removeEventListener( 'mouseup', this.draggingEnded );

		document.removeEventListener( 'touchmove', this.dragging );
		document.removeEventListener( 'touchend', this.draggingEnded );
	},

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
				onMouseDown={ this.onMouseDown }
				onTouchStart={ this.onTouchStart }
			>
			</div>
		);
	}
} );
