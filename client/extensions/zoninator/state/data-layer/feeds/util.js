export const fromApi = posts => posts.map( post => ( {
	ID: post.ID,
	title: post.post_title,
	URL: post.guid,
} ) );

export const toApi = posts => ( {
	post_ids: posts.map( post => post.ID ),
} );
