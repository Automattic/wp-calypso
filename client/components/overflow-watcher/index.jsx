/** @format */
/**
 * External Dependencies
 */
import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { get } from 'lodash';

const OverflowWatcher = Comp =>
	class OverflowWatcherComponent extends Component {
		state = {
			overflowX: false,
			ovewflowY: false,
		};

		handleResize = () => {
			this.checkSize();
		};

		componentDidMount() {
			window.addEventListener( 'resize', this.handleResize );
			this.checkSize();
		}

		componentDidUpdate() {
			this.checkSize();
		}

		componentWillUnmount() {
			window.removeEventListener( 'resize', this.handleResize );
		}

		storeRef = node => {
			this.sizeNode = get( node, [ 'refs', 'overflowNode' ], node );
		};

		checkSize = () => {
			if ( ! this.sizeNode ) {
				this.setState( {
					overflowX: false,
					overflowY: false,
				} );
			}

			const domNode = findDOMNode( this.sizeNode );
			const overflowX = domNode.scrollWidth > domNode.clientWidth + 4;
			const overflowY = domNode.scrollHeight > domNode.clientHeight + 4;
			if ( this.state.overflowX !== overflowX ) {
				this.setState( { overflowX } );
			}
			if ( this.state.overflowY !== overflowY ) {
				this.setState( { overflowY } );
			}
		};

		render() {
			return <Comp ref={ this.storeRef } { ...this.props } { ...this.state } />;
		}
	};

export default OverflowWatcher;
