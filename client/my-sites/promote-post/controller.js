import PromotedPosts from 'calypso/my-sites/promote-post/main';

export const promotedPosts = ( context, next ) => {
	context.primary = <PromotedPosts />;
	next();
};
