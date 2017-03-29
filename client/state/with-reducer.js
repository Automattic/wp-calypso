/**
 * External dependencies
 */
import { createElement, Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */

/**
 * Higher Order Component to add a reducer to the store's reducer list.
 * TODO: Add this file to a place accessible by all extensions when it's ready.
 *
 * @param { string } reducerName The name for the reducer/key for redux state tree.
 * @param { func } reducerFunc The function that takes (state, action) and returns state.
 * @returns { func } A curried function that takes a component to wrap.
 */
export default function withReducer( reducerName, reducerFunc ) {
	return function wrapWithWithReducer( WrappedComponent ) {
		const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
		const displayName = `WithReducer${ wrappedComponentName }[${ reducerName }]`;

		class WithReducer extends Component {
			static contextTypes = {
				store: PropTypes.object,
			}

			constructor( props, context ) {
				super( props, context );
				this.store = props.store || context.store;

				if ( ! this.store ) {
					throw new Error(
						'Could not find \'store\' in either context or props of ' +
						`'${ displayName }'. Either wrap the root component in a <Provider>, ` +
						`or explicitly pass 'store' as a prop to '${ displayName }'.`
					);
				}
				if ( ! this.store.addReducer ) {
					throw new Error(
						'\'store\' provided cannot add/remove reducers dynamically. ' +
						`Ensure that the store was created using 'createReduxStore()'.`
					);
				}
			}

			componentDidMount() {
				this.store.addReducer( reducerName, reducerFunc );
			}

			componentWillUnmount() {
				this.store.removeReducer( reducerName );
				this.store = null;
			}

			render() {
				return createElement( WrappedComponent, this.props );
			}
		}

		return WithReducer;
	};
}

