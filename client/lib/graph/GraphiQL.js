/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import GraphiQL from 'graphiql';

export default class GraphiQLWrapper extends Component {
	static contextTypes = {
		graph: PropTypes.object.isRequired
	};

	fetch = ( { query } ) => {
		return this.context.graph.request( query, { uid: 'graphiql' } );
	};

	render() {
		return (
			<div className="graph__graphiql-container">
				<GraphiQL fetcher={ this.fetch } />
			</div>
		);
	}
}
