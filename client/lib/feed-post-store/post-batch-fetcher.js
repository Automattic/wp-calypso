var assign = require( 'lodash/assign' ),
	forOwn = require( 'lodash/forOwn' ),
	Immutable = require( 'immutable' ),
	noop = require( 'lodash/noop' );

var FeedPostStore = require( './' ),
	wpcom = require( 'lib/wp' );

function PostBatchFetcher( options ) {
	assign( this, {
		BATCH_SIZE: 7,
		onFetch: noop,
		onPostReceived: noop,
		onError: noop,
		apiVersion: '1.1'
	}, options );

	this.postsToFetch = Immutable.OrderedSet(); // eslint-disable-line new-cap
	this.batchQueued = false;
}

assign( PostBatchFetcher.prototype, {

	add: function( postKey ) {
		this.postsToFetch = this.postsToFetch.add( Immutable.fromJS( postKey ) );

		if ( ! this.batchQueued ) {
			this.batchQueued = setTimeout( this.run.bind( this ), 0 );
		}
	},

	remove: function( postKey ) {
		this.postsToFetch = this.postsToFetch.delete( Immutable.fromJS( postKey ) );
	},

	run: function() {
		const toFetch = this.postsToFetch;

		this.batchQueued = false;

		if ( toFetch.size === 0 ) {
			return;
		}

		toFetch.forEach( function( postKey ) {
			var post;

			postKey = postKey.toJS();
			post = FeedPostStore.get( postKey );

			if ( post && post._state !== 'minimal' ) {
				throw new Error( post._state );
			}

			this.onFetch( postKey );

			this.makeRequest( postKey ).then(
				data => {
					this.onPostReceived( postKey.blogId || postKey.feedId, postKey.postId, data );
				},
				err => {
					this.onError( err, postKey );
				}
			);
		}, this );

		this.postsToFetch = Immutable.OrderedSet(); // eslint-disable-line new-cap
	}
} );

module.exports = PostBatchFetcher;
