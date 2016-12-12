/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { isString, uniqueId, throttle } from 'lodash';

/**
 * Internal dependencies
 */
import { makePromiseCancelable } from 'lib/promises';
import { clearRequests } from 'state/requests/actions';
import parse from './executor/parse';

const THROTTLE_DELAY = 50;

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
			const throttledRequest = throttle( this.request, THROTTLE_DELAY, { leading: true } );
			this.unsubscribe = this.context.graph.store.subscribe( throttledRequest );
			this.request();
		}

		componentWillUnmount() {
			this.cancelRequest();
			this.unsubscribe && this.unsubscribe();
			this.context.graph.store.dispatch( clearRequests( this.uid ) );
		}

		componentWillReceiveProps( newProps ) {
			this.buildQuery( newProps );
			this.request();
		}

		buildQuery( props ) {
			if ( isString( mapPropsToQuery ) ) {
				this.query = mapPropsToQuery;
			} else {
				this.query = mapPropsToQuery( props );
			}
			this.variables = mapPropsToVariables( props );
			this.parsedQuery = parse( this.query, this.variables );
		}

		cancelRequest() {
			this.cancelRequestPromise && this.cancelRequestPromise();
		}

		request = () => {
			this.cancelRequest();
			const cancelablePromise = makePromiseCancelable(
				this.context.graph.request( this.query, { uid: this.uid }, this.variables, this.parsedQuery )
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
		};

		render() {
			return (
				<WrappedComponent { ...this.props } results={ this.state.results } />
			);
		}
	};
};

export default query;
