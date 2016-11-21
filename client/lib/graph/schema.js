export default `
	# Object containing details about the post's comments
	type PostDiscussion {
		comment_count: Int
		comments_open: String
	}

	# Object containing details about the post's author
	type PostAuthor {
		name: String
	}

	type PostCapabilities {
		edit_post: Boolean
	}

	# Object representing a Post
	type Post {
		ID: Int!
		author: PostAuthor
		canonical_image: String
		capabilities: PostCapabilities
		date: String
		discussion: PostDiscussion
		excerpt: String
		format: String
		global_ID: String
		password: String
		like_count: Int
		likes_enabled: Boolean
		site_ID: Int
		status: String
		title: String
		type: String
		URL: String
		stat( stat: String ): Int
	}

	# Object representing a Query Post Response
	type PostQueryResponse {
		items: [Post]
		requesting: Boolean
		lastPage: Int
	}

	# Query object used to search for posts
	input PostQuery {
		status: String
		number: Int
		author: Int
		search: String
		status: String
	}

	# Root Query Object
	type Query {
		# GraphQL hello world
		hello: String
		# Query posts by siteId and postId
		post( siteId: Int, postId: Int ): Post
		# Query posts by siteId and query object
		posts( siteId: Int, query: PostQuery, pages: [Int] ): PostQueryResponse
		# Query post stats by siteId, postId and stat name
		postStat( siteId: Int, postId: Int, stat: String ): Int
	}
`;
