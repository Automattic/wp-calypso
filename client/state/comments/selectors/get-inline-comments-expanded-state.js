import 'calypso/state/comments/init';

export const getInlineCommentsExpandedState = ( state, streamKey, siteId, postId ) => {
	return !! state.comments.inlineExpansion?.[ streamKey ]?.[ siteId ]?.[ postId ];
};
