// External Dependencies
var trim = require( 'lodash/string/trim' );

// Internal Dependencies
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' );

var tagsLoading = {},
	subscriptionsLoading = false;

var ReaderTagActions = {

	fetchSubscriptions: function() {
		if ( subscriptionsLoading ) {
			return;
		}

		subscriptionsLoading = true;

		wpcom.undocumented().readTags( function( error, data ) {
			subscriptionsLoading = false;

			Dispatcher.handleServerAction( {
				type: 'RECEIVE_READER_TAG_SUBSCRIPTIONS',
				data: data,
				error: error
			} );
		} );
	},

	fetchTag: function( slug ) {
		if ( tagsLoading[ slug ] ) {
			return;
		}

		tagsLoading[ slug ] = true;

		wpcom.undocumented().readTag( { slug }, function( error, data ) {
			delete tagsLoading[ slug ];

			Dispatcher.handleServerAction( {
				type: 'RECEIVE_READER_TAG',
				data: data,
				error: error
			} );
		} );
	},

	slugify: function( tag ) {
		return encodeURIComponent(
			trim( tag )
				.toLowerCase()
				.replace( /\s+/g, '-' )
				.replace( /-{2,}/g, '-' )
		);
	},

	follow: function( newTag ) {
		var newTagTitle, newTagSlug;
		if ( newTag && newTag.slug ) {
			newTagTitle = newTag.title;
			newTagSlug = newTag.slug;
		} else {
			newTagTitle = newTag;
			newTagSlug = ReaderTagActions.slugify( newTag );
		}

		if ( ! newTagSlug ) {
			return;
		}

		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_TAG',
			data: {
				title: newTagTitle,
				slug: newTagSlug
			}
		} );

		wpcom.undocumented().followReaderTag( newTagSlug, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_FOLLOW_READER_TAG',
				data: data,
				error: error,
				newSlug: newTagSlug
			} );
		} );
	},

	unfollow: function( tag ) {
		Dispatcher.handleViewAction( {
			type: 'UNFOLLOW_READER_TAG',
			data: { slug: tag.slug }
		} );

		wpcom.undocumented().unfollowReaderTag( tag.slug, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_UNFOLLOW_READER_TAG',
				data: data,
				error: error
			} );
		} );
	}
};

module.exports = ReaderTagActions;
