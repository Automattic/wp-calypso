/** @format */
/**
 * External Dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

/**
 * withDimensions is a Hoc that hands down a width and height prop of how much available space there is for it to consume.
 * withDimensions assumes that you care about the space at the dom location of the component, but you may also pass
 * in a domTarget in case you want to be tracking the dimensions of a different component
 *
 * @example: withDimensions( Component )
 *
 * @param {object} EnhancedComponent - react component to wrap and give the prop width/height to
 * @returns {object} the enhanced component
 */
export default EnhancedComponent =>
	class WithWidth extends React.Component {
		static displayName = `WithDimensions( ${ EnhancedComponent.displayName ||
			EnhancedComponent.name } )`;
		static propTypes = { domTarget: PropTypes.object };

		state = {
			width: 0,
			height: 0,
		};

		handleResize = ( props = this.props ) => {
			const domElement = props.domTarget || this.setRef || this.divRef;

			if ( domElement ) {
				const dimensions = domElement.getClientRects()[ 0 ];
				const { width, height } = dimensions;
				const overflowX = domElement.scrollWidth > domElement.clientWidth;
				const overflowY = domElement.scrollHeight > domElement.clientHeight;

				this.setState( { width, height, overflowX, overflowY } );
			}
		};

		componentDidMount() {
			this.resizeEventListener = window.addEventListener(
				'resize',
				debounce( this.handleResize, 50 )
			);
			this.handleResize();
		}
		componentWillReceiveProps( nextProps ) {
			this.handleResize( nextProps );
		}
		componentWillUnmount() {
			window.removeEventListener( 'resize', this.resizeEventListener );
		}

		handleMount = ref => ( this.divRef = ref );
		setWithDimensionsRef = ref => ( this.setRef = ref );

		render() {
			return (
				<div ref={ this.handleMount }>
					<EnhancedComponent
						{ ...this.props }
						width={ this.state.width }
						height={ this.state.height }
						overflowX={ this.state.overflowX }
						overflowY={ this.state.overflowY }
						setWithDimensionsRef={ this.setWithDimensionsRef }
					/>
				</div>
			);
		}
	};
