
/**
 * External dependencies
 */
var wpcom = require( 'lib/wp' ),
	Dispatcher = require( 'dispatcher' );

/**
 * Internal dependencies
 */

var constants = require( './constants' ),
	_fetching = {};

function getStatKey( stat, siteId, postId ) {
	return stat + '|' + siteId + '|' + postId;
}

function receiveTotalViews( siteId, postId, error, data ) {
	var key = getStatKey( 'totalViews', siteId, postId );

	delete _fetching[ key ];
	Dispatcher.handleServerAction( {
		type: constants.RECEIVE_TOTAL_POST_VIEWS,
		siteId: siteId,
		postId: postId,
		error: error,
		data: data
	} );
}

function fetch( stat, siteId, postId, force ) {
	var key = getStatKey( stat, siteId, postId );

	// By default, block additional requests for this stat until we get a response
	if ( ! force && isBlocked( key ) ) {
		return;
	}

	_fetching[ key ] = new Date().getTime();

	switch( stat ) {
		case 'totalViews':
			wpcom.site( siteId ).statsPostViews( postId, {
				fields: 'views'
			}, receiveTotalViews.bind( null, siteId, postId ) );
			break;
	}
}

function fetchTotalViews( siteId, postId, force ) {
	fetch( 'totalViews', siteId, postId, force );
}

function isBlocked( key ) {
	return _fetching[ key ] && (
		_fetching[ key ] + constants.API_CALL_LIMIT_MS > new Date().getTime()
	);
}

var PostStatsActions = {
	fetchTotalViews: fetchTotalViews
};

module.exports = PostStatsActions;
