var feedStreams = {};

module.exports = {
	get: function( id ) {
		return feedStreams[ id ];
	},
	set: function( id, store ) {
		feedStreams[ id ] = store ;
	}
};
