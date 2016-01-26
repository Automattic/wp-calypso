var forOwn = require( 'lodash/object/forOwn' );

var decodeEntities = require( 'lib/formatting' ).decodeEntities,
	dispatcher = require( 'dispatcher' ),
	emitter = require( 'lib/mixins/emitter' );

var tags = {};

var TagStore = {
	get( slug ) {
		return tags[ slug ];
	}
};

emitter( TagStore );

function receiveTags( newTags ) {
	forOwn( newTags, ( sub ) => {
		sub.URL = '/tag/' + sub.slug;
		sub.title = decodeEntities( sub.title );
		sub.slug = sub.slug.toLowerCase();
		tags[ sub.slug ] = sub;
	} );
	TagStore.emit( 'change' );
}

function markPending( slug ) {
	var tag = tags[ slug ];
	if ( ! tag ) {
		tag = {
			slug: slug,
			title: slug,
			ID: null,
			_state: 'pending'
		};
		tags[ slug ] = tag;
		TagStore.emit( 'change' );
	}
}

TagStore.dispatchToken = dispatcher.register( function( payload ) {
	const action = payload.action;

	if ( ! action || action.error ) {
		return;
	}

	switch ( action.type ) {
		case 'FOLLOW_READER_TAG':
			markPending( action.slug );
			break;
		case 'RECEIVE_READER_TAG':
			if ( action.data && action.data.tag ) {
				receiveTags( [ action.data.tag ] );
			}
			break;
		case 'RECEIVE_READER_TAG_SUBSCRIPTIONS':
		case 'RECEIVE_UNFOLLOW_READER_TAG':
		case 'RECEIVE_FOLLOW_READER_TAG':
			if ( action.data && action.data.tags ) {
				receiveTags( action.data.tags );
			}
			break;
	}
} );

module.exports = TagStore;
