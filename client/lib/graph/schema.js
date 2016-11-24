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

	# Object containing post capabilities
	type PostCapabilities {
		edit_post: Boolean
	}

	# Object representing a post's attachment
	type PostImage {
		src: String
	}

	# Object containing post images
	type PostImages {
		featured_image: String
		images: [PostImage]
	}

	# Object representing a Post
	type Post {
		ID: Int!
		author: PostAuthor
		capabilities: PostCapabilities
		date: String
		discussion: PostDiscussion
		excerpt: String
		featured_image: String
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
		images( minWidth: Int, minHeight: Int ): PostImages
	}

	# Object representing a Query Post Response
	type PostQueryResponse {
		items: [Post]
		requesting: Boolean
		lastPage: Int
	}

	# Object representing Posts Count by status
	type PostsCount {
		draft: Int
		publish: Int
		private: Int
		future: Int
		pending: Int
		trash: Int
	}

	# Object representing PostsCounts by author
	type PostsCounts {
		mine: PostsCount
		all: PostsCount
		requesting: Boolean
	}

	# Query object used to search for posts
	input PostQuery {
		status: String
		number: Int
		author: Int
		search: String
		status: String
		order_by: String
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
		# Query postCounts by siteId and postType
		postsCount( siteId: Int, postType: String ): PostsCounts
	}
`;
