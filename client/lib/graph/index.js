/**
 * External dependencies
 */
import { graphql, buildSchema } from 'graphql';
import createPostResolver from './resolvers/post';
import createPostsResolver from './resolvers/posts';
import createPostStatResolver from './resolvers/post-stat';
import createPostsCountResolver from './resolvers/posts-count';
import graphqlSchema from './schema';
import execute from './executor';

function createGraph( store ) {
	const schema = buildSchema( graphqlSchema );

	const root = {
		hello: () => {
			return 'Hello world!';
		},
		post: createPostResolver( store ),
		posts: createPostsResolver( store ),
		postStat: createPostStatResolver( store ),
		postsCount: createPostsCountResolver( store ),
	};

	const request = ( query, context, variables, parsedQuery ) => {
		let promise;
		if ( process.env.NODE_ENV === 'development' ) {
			promise = graphql( schema, query, root, context, variables );
		} else {
			promise = execute( parsedQuery, root, context );
		}

		return promise;
	};

	return {
		request,
		store
	};
}

export default createGraph;
