/**
 * External dependencies
 */
import { graphql, buildSchema } from 'graphql';
import createPostResolver from './resolvers/post';
import createPostsResolver from './resolvers/posts';
import createPostStatResolver from './resolvers/post-stat';
import createPostsRequestResolver from './resolvers/posts-request';

function createGraph( store ) {
	const schema = buildSchema( `
		type PostDiscussion {
			comment_count: Int
		}

		type Post {
			ID: Int!
			date: String
			title: String
			URL: String
			like_count: Int
			discussion: PostDiscussion
			stat(stat: String): Int
		}

		input PostQuery {
			status: String
			number: Int
		}

		type Requests {
			posts(siteId: Int, query: PostQuery): Boolean
		}

		type Query {
			hello: String
			post(siteId: Int, postId: Int): Post
			posts(siteId: Int, query: PostQuery): [Post]
			postStat(siteId: Int, postId: Int, stat: String): Int
			requests: Requests
		}
	` );

	const root = {
		hello: () => {
			return 'Hello world!';
		},
		post: createPostResolver( store ),
		posts: createPostsResolver( store ),
		postStat: createPostStatResolver( store ),
		requests: {
			posts: createPostsRequestResolver( store )
		}
	};

	const request = query => {
		return graphql( schema, query, root );
	};

	return {
		request,
		subscribe: store.subscribe.bind( store )
	};
}

export default createGraph;
