/**
 * External Dependencies
 */
import React from 'react';
import { debounce } from 'lodash';

/**
 * withDimensions is a Hoc that hands down a width and height prop of how much available space there is for it to consume.
 * withDimensions assumes that you care about the space at the dom location of the component, but you may also pass
 * in a domTarget in case you want to be tracking the dimensions of a different component
 *
 * @example:
 * 1. withDimensions( Component )
 * 2. withDimensions( Component, { domTarget: thingWhoseDimensionsToTrack } )
 *
 * @param {object} EnhancedComponent - react component to wrap and give the prop width/height to
 * @returns {object} the enhanced component
 */
export default ( EnhancedComponent, { domTarget } = {} ) => class WithWidth extends React.Component {
	static displayName = `WithWidth( ${ EnhancedComponent.displayName } )`;

	state = {
		width: 0,
	};

	handleResize = () => {
		const domElement = domTarget ? domTarget : this.divRef;

		if ( domElement ) {
			const dimensions = domElement.getClientRects()[ 0 ];
			const { width, height } = dimensions;
			this.setState( { width, height } );
		}
	};

	componentDidMount() {
		this.resizeEventListener = window.addEventListener(
			'resize',
			debounce( this.handleResize, 50 )
		);
		this.handleResize();
	}
	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resizeEventListener );
	}

	handleMount = c => this.divRef = c;

	render() {
		return (
			<div ref={ this.handleMount }>
				<EnhancedComponent
					{ ...this.props }
					width={ this.state.width }
					height={ this.state.height }
				/>
			</div>
		);
	}
};
