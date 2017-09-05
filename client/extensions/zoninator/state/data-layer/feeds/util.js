export const fromApi = data => data.map( post => post.ID );

export const toApi = postIds => ( { post_ids: postIds } );
