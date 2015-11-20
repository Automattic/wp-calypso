var assign = require( 'lodash/object/assign' ),
	forOwn = require( 'lodash/object/forOwn' ),
	Immutable = require( 'immutable' ),
	noop = require( 'lodash/utility/noop' );

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
		var toFetch = this.postsToFetch,
			batch, batchSet,
			index = 0;

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
		}, this );

		function addToBatch( postKey ) {
			batch.add( this.buildUrl( postKey.toJS() ) );
		}

		while ( index < toFetch.size && ( batchSet = toFetch.slice( index, index + this.BATCH_SIZE ) ).size > 0 ) {
			batch = wpcom.batch();
			batchSet.forEach( addToBatch, this );
			batch.run( { apiVersion: this.apiVersion }, this.receiveBatch.bind( this, batchSet ) );
			index += this.BATCH_SIZE;
		}

		this.postsToFetch = Immutable.OrderedSet(); // eslint-disable-line new-cap
	},

	receiveBatch: function( batchSet, error, data ) {
		if ( error ) {
			batchSet.forEach( function( val ) {
				this.onError( error, val );
			}, this );
			return;
		}

		if ( data ) {
			forOwn( data, function( post, key ) {
				// Batches return a map of URL requested to result. This regex pulls
				// the container ID and post ID back out of each URL, so we know which
				// post is which
				var match = this.resultKeyRegex.exec( key ), containerId, postId;

				if ( ! match ) {
					return;
				}

				containerId = +match[ 1 ];
				postId = +match[ 2 ];

				if ( ! ( containerId && postId ) ) {
					return;
				}

				this.onPostReceived( containerId, postId, post );
			}, this );
		}
	}
} );

module.exports = PostBatchFetcher;
