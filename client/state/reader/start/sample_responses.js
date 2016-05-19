export const sampleSuccessResponse = {
	recommendations: [
		{
			site_ID: 82798297,
			post_ID: 82,
			meta: {
				links: {
					blog: "https://public-api.wordpress.com/rest/v1.1/read/sites/82798297",
					post: "https://public-api.wordpress.com/rest/v1.1/read/sites/82798297/posts/82"
				},
				data: {
					site: {
						ID: 82798297,
						name: "futonbleu",
						description: "This is the site description"
					},
					post: {
						ID: 82,
						author: { "ID": 78813796, login: "futonbleu", name: "futonbleu" },
						title: "Comment test",
						excerpt: "<p>I have a feeling this post will prompt some discussion.</p>"
					}
				}
			}
		}
	]
};