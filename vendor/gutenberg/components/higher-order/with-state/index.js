/**
 * WordPress dependencies
 */
import { Component, createHigherOrderComponent } from '@wordpress/element';

/**
 * A Higher Order Component used to provide and manage internal component state
 * via props.
 *
 * @param {?Object} initialState Optional initial state of the component.
 *
 * @return {Component} Wrapped component.
 */
export default function withState( initialState = {} ) {
	return createHigherOrderComponent( ( OriginalComponent ) => {
		return class WrappedComponent extends Component {
			constructor() {
				super( ...arguments );

				this.setState = this.setState.bind( this );

				this.state = initialState;
			}

			render() {
				return (
					<OriginalComponent
						{ ...this.props }
						{ ...this.state }
						setState={ this.setState }
					/>
				);
			}
		};
	}, 'withState' );
}
