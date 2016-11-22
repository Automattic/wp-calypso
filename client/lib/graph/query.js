/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { isString, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import { makePromiseCancelable } from 'lib/promises';
import { clearRequests } from 'state/requests/actions';

const query = ( mapPropsToQuery, mapPropsToVariables = () => ( {} ) ) => ( WrappedComponent ) => {
	return class GraphQueryComponent extends Component {
		state = {
			results: null
		};

		uid = uniqueId();

		static contextTypes = {
			graph: PropTypes.object
		};

		constructor( props, context ) {
			super( props, context );
			this.buildQuery( props );
		}

		componentDidMount() {
			this.unsubscribe = this.context.graph.store.subscribe( () => {
				this.request();
			} );
			this.request();
		}

		componentWillUnmount() {
			this.cancelRequest();
			this.unsubscribe && this.unsubscribe();
			this.context.graph.store.dispatch( clearRequests( this.uid ) );
		}

		componentWillReceiveProps( newProps ) {
			this.buildQuery( newProps );
		}

		buildQuery( props ) {
			if ( isString( mapPropsToQuery ) ) {
				this.query = mapPropsToQuery;
			} else {
				this.query = mapPropsToQuery( props );
			}
			this.variables = mapPropsToVariables( props );
		}

		cancelRequest() {
			this.cancelRequestPromise && this.cancelRequestPromise();
		}

		request() {
			this.cancelRequest();
			const cancelablePromise = makePromiseCancelable(
				this.context.graph.request( this.query, { uid: this.uid }, this.variables )
			);
			this.cancelRequestPromise = cancelablePromise.cancel;
			cancelablePromise.promise
				.then( results => {
					if ( results.errors ) {
						console.warn( results.errors ); // eslint-disable-line no-console
					}
					this.setState( { results: results.data } );
					this.cancelRequestPromise = false;
				} )
				.catch( () => {} ); // avoid console warnings
		}

		render() {
			return (
				<WrappedComponent { ...this.props } results={ this.state.results } />
			);
		}
	};
};

export default query;
