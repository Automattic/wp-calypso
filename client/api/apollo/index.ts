import { ApolloClient, ApolloLink, from, HttpLink, InMemoryCache } from '@apollo/client';

const GRAPHQL_URL = 'http://localhost:4000/api/graphql';

const httpLink = new HttpLink( {
	uri: GRAPHQL_URL,
	credentials: 'same-origin',
} );

const authMiddleware = new ApolloLink( ( operation, forward ) => {
	return forward( operation );
} );

const apollo = new ApolloClient( {
	link: from( [ authMiddleware, httpLink ] ),
	cache: new InMemoryCache(),
} );

export default apollo;
