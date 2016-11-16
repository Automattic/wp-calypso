/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { isString, uniqueId } from 'lodash';

/**
 * Internal dependencies
 */
import { clearRequests } from 'state/requests/actions';

const query = ( mapPropsToQuery ) => ( WrappedComponent ) => {
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
		}

		request() {
			this.context.graph.request( this.query, { uid: this.uid } )
				.then( results => {
					this.setState( { results: results.data } );
				} );
		}

		render() {
			return (
				<WrappedComponent { ...this.props } results={ this.state.results } />
			);
		}
	};
};

export default query;
