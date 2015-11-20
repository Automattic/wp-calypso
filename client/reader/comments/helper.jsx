// Internal dependencies
var DiscoverHelper = require( 'reader/discover/helper' );

module.exports = {
	shouldShowComments: function( post ) {
		var showComments = false,
			isDiscoverPost = DiscoverHelper.isDiscoverPost( post );

		if ( isDiscoverPost ) {
			if ( DiscoverHelper.isInternalDiscoverPost( post ) && ! DiscoverHelper.isDiscoverSitePick( post ) ) {
				showComments = true;
			}
		} else if ( ! post.is_jetpack && post.discussion && ( post.discussion.comments_open || post.discussion.comment_count > 0 ) ) {
			showComments = true;
		}

		return showComments;
	}
};
