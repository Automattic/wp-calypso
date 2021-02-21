export const fromApi = ( posts, siteId ) =>
	posts.map( ( post ) => ( {
		id: post.ID,
		siteId,
		title: post.post_title,
		url: post.guid,
	} ) );

export const toApi = ( posts ) => ( {
	post_ids: posts.map( ( post ) => post.id ),
} );
