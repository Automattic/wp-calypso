/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class HoverIntent extends Component {
	constructor() {
		super();
		this.x = 0;
		this.y = 0;
		this.pX = 0;
		this.pY = 0;
		this.status = 0;
		this.timer = 0;
	}
	componentDidMount() {
		this.element.addEventListener( 'mouseover', this.dispatchOver, false );
		this.element.addEventListener( 'mouseout', this.dispatchOut, false );
	}
	componentWillUnmount() {
		this.element.removeEventListener( 'mouseover', this.dispatchOver, false );
		this.element.removeEventListener( 'mouseout', this.dispatchOut, false );
	}
	delay = ( e ) => {
		if ( this.timer ) this.timer = clearTimeout( this.timer );
		this.status = 0;
		return this.props.onMouseOut.call( this.element, e );
	};
	tracker = ( e ) => {
		this.x = e.clientX;
		this.y = e.clientY;
	};
	compare = ( e ) => {
		if ( this.timer ) this.timer = clearTimeout( this.timer );
		if ( Math.abs( this.pX - this.x ) + Math.abs( this.pY - this.y ) < this.props.sensitivity ) {
			this.status = 1;
			return this.props.onMouseOver.call( this.element, e );
		}
		this.pX = this.x;
		this.pY = this.y;
		this.timer = setTimeout( () => this.compare( this.element, e ), this.props.interval );
	};
	dispatchOver = ( e ) => {
		if ( this.timer ) this.timer = clearTimeout( this.timer );
		this.element.removeEventListener( 'mousemove', this.tracker, false );
		if ( this.status !== 1 ) {
			this.pX = e.clientX;
			this.pY = e.clientY;
			this.element.addEventListener( 'mousemove', this.tracker, false );
			this.timer = setTimeout( () => this.compare( this.element, e ), this.props.interval );
		}
	};
	dispatchOut = ( e ) => {
		if ( this.timer ) this.timer = clearTimeout( this.timer );
		this.element.removeEventListener( 'mousemove', this.tracker, false );
		if ( this.status === 1 ) {
			this.timer = setTimeout( () => this.delay( this.element, e ), this.props.timeout );
		}
	};
	render() {
		return React.cloneElement( this.props.children, {
			ref: ( element ) => {
				this.element = element;
			},
		} );
	}
}

HoverIntent.defaultProps = {
	sensitivity: 7,
	interval: 100,
	timeout: 0,
};

HoverIntent.propTypes = {
	sensitivity: PropTypes.number,
	interval: PropTypes.number,
	timeout: PropTypes.number,
	onMouseOver: PropTypes.func,
	onMouseOut: PropTypes.func,
	children: PropTypes.node,
};

export default HoverIntent;
