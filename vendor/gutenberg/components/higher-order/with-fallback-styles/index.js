/**
 * External dependencies
 */
import { every, isEqual } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, createHigherOrderComponent } from '@wordpress/element';

export default ( mapNodeToProps ) => createHigherOrderComponent(
	( WrappedComponent ) => {
		return class extends Component {
			constructor() {
				super( ...arguments );
				this.nodeRef = this.props.node;
				this.state = {
					fallbackStyles: undefined,
					grabStylesCompleted: false,
				};

				this.bindRef = this.bindRef.bind( this );
			}

			bindRef( node ) {
				if ( ! node ) {
					return;
				}
				this.nodeRef = node;
			}

			componentDidMount() {
				this.grabFallbackStyles();
			}

			componentDidUpdate() {
				this.grabFallbackStyles();
			}

			grabFallbackStyles() {
				const { grabStylesCompleted, fallbackStyles } = this.state;
				if ( this.nodeRef && ! grabStylesCompleted ) {
					const newFallbackStyles = mapNodeToProps( this.nodeRef, this.props );
					if ( ! isEqual( newFallbackStyles, fallbackStyles ) ) {
						this.setState( {
							fallbackStyles: newFallbackStyles,
							grabStylesCompleted: !! every( newFallbackStyles ),
						} );
					}
				}
			}

			render() {
				const wrappedComponent = <WrappedComponent { ...this.props } { ...this.state.fallbackStyles } />;
				return this.props.node ? wrappedComponent : <div ref={ this.bindRef }> { wrappedComponent } </div>;
			}
		};
	},
	'withFallbackStyles'
);
