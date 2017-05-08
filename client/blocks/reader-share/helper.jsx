
const exported = {
	shouldShowShare: function( post ) {
		return ! post.site_is_private;
	}
};

export default exported;

export const {
    shouldShowShare
} = exported;
