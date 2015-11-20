/**
 * External Dependencies
 */
var Dispatcher = require( 'dispatcher' );

/**
 * Internal Dependencies
 */
var User = require( './user' ),
	_user = false;

module.exports = function() {
	if ( ! _user ) {
		_user = new User();
	}
	return _user;
};

User.dispatchToken = Dispatcher.register( function( payload ) {
	var action = payload.action;
	switch ( action.type ) {
		case 'DELETE_SITE':
			decrementSiteCount();
			break;
		case 'RECEIVE_DELETED_SITE':
			_user.fetch();
			break;
	}
} );

function decrementSiteCount() {
	var data = _user.get(),
		attributes = {
			visible_site_count: data.visible_site_count - 1,
			site_count: data.site_count - 1
		};
	_user.set( attributes );
}
