import PromotedPosts from 'calypso/my-sites/promote-post/main';

export const promotedPosts = ( context, next ) => {
	const { tab } = context.params;
	context.primary = <PromotedPosts tab={ tab } />;
	next();
};
