
module.exports = {
	shouldShowShare: function( post ) {
		return ! post.site_is_private;
	}
};

