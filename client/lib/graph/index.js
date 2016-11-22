/**
 * External dependencies
 */
import { graphql, buildSchema } from 'graphql';
import createPostResolver from './resolvers/post';
import createPostsResolver from './resolvers/posts';
import createPostStatResolver from './resolvers/post-stat';
import createPostsCountResolver from './resolvers/posts-count';
import graphqlSchema from './schema';

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

	const request = ( query, context, variables ) => {
		return graphql( schema, query, root, context, variables );
	};

	return {
		request,
		store
	};
}

export default createGraph;
