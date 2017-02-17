/**
 * External dependencies
 */
import { createElement, Component } from 'react';

/**
 * Internal dependencies
 */
import { addReducer, removeReducer } from 'state';

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
		class WithReducer extends Component {
			constructor( props, context ) {
				super( props, context );
				this.reducerName = reducerName;
				this.reducerFunc = reducerFunc;
			}

			componentDidMount() {
				addReducer( reducerName, reducerFunc );
			}

			componentWillUnmount() {
				removeReducer( reducerName );
			}

			render() {
				const result = createElement( WrappedComponent, this.props );
				return result;
			}
		}

		return WithReducer;
	};
}

