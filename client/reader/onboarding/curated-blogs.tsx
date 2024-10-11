interface CuratedBlog {
	feed_ID: number;
	site_ID: number;
	site_URL: string;
	site_name: string;
}

export const curatedBlogs: Record< string, CuratedBlog[] > = {
	wordpress: [
		{
			feed_ID: 188407,
			site_ID: 1047865,
			site_URL: 'https://ma.tt',
			site_name: 'Matt Mullenweg',
		},
		// Add more curated space blogs...
	],
	technology: [
		{
			feed_ID: 188407,
			site_ID: 1047865,
			site_URL: 'https://ma.tt',
			site_name: 'Matt Mullenweg',
		},
		// Add more curated technology blogs...
	],
	// Add more tags and their curated blogs...
};
