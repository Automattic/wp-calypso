import { getToken } from '@automattic/oauth-token';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphiQL } from 'graphiql';
import React from 'react';
import 'graphiql/graphiql.css';

const GRAPHQL_URL = 'https://public-api.wordpress.com/wpcom/v2/agency/graphql';

const GraphiQLComponent: React.FC = () => {
	const fetcher = createGraphiQLFetcher( {
		url: GRAPHQL_URL,
		headers: {
			get Authorization() {
				const token = getToken();
				return token ? `Bearer ${ token }` : '';
			},
		},
	} );

	return (
		<div style={ { height: '100vh', width: '100%' } }>
			<GraphiQL fetcher={ fetcher } />
		</div>
	);
};

export default GraphiQLComponent;
