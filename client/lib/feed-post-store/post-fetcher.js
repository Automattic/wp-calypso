const assign = require( 'lodash/assign' ),
	Immutable = require( 'immutable' ),
	noop = require( 'lodash/noop' );

const FeedPostStore = require( './' );

function PostFetcher( options ) {
	assign( this, {
		onFetch: noop,
		onPostReceived: noop,
		onError: noop
	}, options );

	this.postsToFetch = Immutable.OrderedSet(); // eslint-disable-line new-cap
	this.batchQueued = false;
}

assign( PostFetcher.prototype, {

	add: function( postKey ) {
		this.postsToFetch = this.postsToFetch.add( Immutable.fromJS( postKey ) );

		if ( ! this.batchQueued ) {
			this.batchQueued = setTimeout( this.run.bind( this ), 100 );
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
			postKey = postKey.toJS();
			const post = FeedPostStore.get( postKey );

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

module.exports = PostFetcher;
