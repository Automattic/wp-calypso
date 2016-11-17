export default `
	# Object containing details about the post's comments
	type PostDiscussion {
		comment_count: Int
	}

	# Object representing a Post
	type Post {
		ID: Int!
		date: String
		title: String
		URL: String
		like_count: Int
		discussion: PostDiscussion
		stat( stat: String ): Int
	}

	# Query object used to search for posts
	input PostQuery {
		status: String
		number: Int
	}

	# Contains the isRequesting status of different API calls
	type Requests {
		posts( siteId: Int, query: PostQuery ): Boolean
	}

	# Root Query Object
	type Query {
		# GraphQL hello world
		hello: String
		# Query posts by siteId and postId
		post( siteId: Int, postId: Int ): Post
		# Query posts by siteId and query object
		posts( siteId: Int, query: PostQuery ): [Post]
		# Query post stats by siteId, postId and stat name
		postStat( siteId: Int, postId: Int, stat: String ): Int
		requests: Requests
	}
`;
