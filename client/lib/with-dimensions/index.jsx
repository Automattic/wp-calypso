/**
 * External Dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

/**
 * Internal dependencies
 */
import afterLayoutFlush from 'lib/after-layout-flush';

const OVERFLOW_BUFFER = 4; // fairly arbitrary. feel free to tweak

/**
 * withDimensions is a HOC that keeps track of a domNode's dimension-related info and then hands that down to its child.
 *
 * Dimension-related info:
 *  1. width: the pixel width of the domNode
 *  2. height: the pixel height of the domNode
 *  3. overflowX: true if the container is overflowing in the x direction. aka: scrollWidth > width
 *  4. overflowY: true if the container is overflowing in the y direction. aka: scrollHeight > height
 *  5. setWithDimensionsRef: a ref setter to aid in picking which domNode to target.
 *
 * How to specify which domNode to keep track of? In React it is always a bit awkward to get a handle on
 * actual domnodes so this HoC provides a few methods:
 * 1. default: wrap child component in a div and track the div.  requires no ref passing.  means the component essentially gets its own
 *     available width/height/overflow properties
 * 2. provide a prom domTarget to the created component: <EnhancedComponent domTarget={ domNode } />
 * 3. call the provided setWithDimensionsRef function:
 *    withDimensions( ({}) => <div> <span ref ={ this.props.setWithDimensionsRef }> </span></div> )
 *
 * @example: withDimensions( Component )
 *
 * @param {object} EnhancedComponent - react component to wrap and give the prop width/height to
 * @returns {object} the enhanced component
 */
export default ( EnhancedComponent ) =>
	class WithWidth extends React.Component {
		static displayName = `WithDimensions( ${
			EnhancedComponent.displayName || EnhancedComponent.name
		} )`;
		static propTypes = { domTarget: PropTypes.object };

		state = {
			width: 0,
			height: 0,
		};

		handleResize = afterLayoutFlush( ( props = this.props ) => {
			const domElement = props.domTarget || this.setRef || this.divRef;

			if ( domElement ) {
				const dimensions = domElement.getClientRects()[ 0 ];
				if ( ! dimensions ) {
					return;
				}

				const { width, height } = dimensions;
				const overflowX = domElement.scrollWidth > domElement.clientWidth + OVERFLOW_BUFFER;
				const overflowY = domElement.scrollHeight > domElement.clientHeight + OVERFLOW_BUFFER;

				this.setState( { width, height, overflowX, overflowY } );
			}
		} );

		componentDidMount() {
			this.resizeEventListener = window.addEventListener(
				'resize',
				debounce( this.handleResize, 50 )
			);
			this.handleResize();
		}

		UNSAFE_componentWillReceiveProps( nextProps ) {
			this.handleResize( nextProps );
		}

		componentWillUnmount() {
			window.removeEventListener( 'resize', this.resizeEventListener );
		}

		handleMount = ( ref ) => {
			this.divRef = ref;
			this.handleResize();
		};

		setWithDimensionsRef = ( ref ) => {
			this.setRef = ref;
			this.handleResize();
		};

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
