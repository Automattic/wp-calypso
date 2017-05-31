/**
 * External Dependencies
 */
import React from 'react';
import { debounce } from 'lodash';

/**
 * withWidth is a Hoc that hands down a width prop of how much available width there is for it to consume.
 * withWidth assumes that you care about the space at the dom location of the component, but you may also pass
 * in a domTarget in case you want to be tracking the width of a different compoenent
 *
 * @example:
 * 1. widthWidth( Component )
 * 2. withWidth( Component, { domTarget: thingWhoseWidthToTrack } )
 *
 * @param {object} EnhancedComponent - react component to wrap and give the prop width to
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
			const width = domElement.getClientRects()[ 0 ].width;
			this.setState( { width } );
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
				<EnhancedComponent { ...this.props } width={ this.state.width } />
			</div>
		);
	}
};
