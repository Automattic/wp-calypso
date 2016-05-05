module.exports = {
	key: function( siteId, commentId ) {
		if ( ! siteId || ! commentId ) {
			throw new Error( 'siteId and commentId must be non-empty' );
		}
		return siteId + '-' + commentId;
	}
};
