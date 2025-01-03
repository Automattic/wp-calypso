import { ApolloClient, ApolloLink, from, HttpLink, InMemoryCache } from '@apollo/client';
import { getToken } from '@automattic/oauth-token';

const GRAPHQL_URL = 'https://public-api.wordpress.com/wpcom/v2/agency/graphql';

const httpLink = new HttpLink( {
	uri: GRAPHQL_URL,
	credentials: 'same-origin',
} );

const authMiddleware = new ApolloLink( ( operation, forward ) => {
	const token = getToken();
	if ( token ) {
		operation.setContext( {
			headers: {
				Authorization: `Bearer ${ token }`,
			},
		} );
	}
	return forward( operation );
} );

const apollo = new ApolloClient( {
	link: from( [ authMiddleware, httpLink ] ),
	cache: new InMemoryCache(),
} );

export default apollo;
