
// External dependencies
var Dispatcher = require( 'dispatcher' );

// Internal dependencies
var constants = require( './constants' );

/**
 * @param  {[string]} filter   representative of a stats filter behavior, false will be ignored
 * @param  {[string]} slug     a site's domain (or suboptimally a siteId), false will be ignored
 */
function saveFilterAndSlug( filter, slug ) {
	Dispatcher.handleViewAction( {
		type: constants.actions.RECEIVE_STATS_FILTER_AND_SLUG,
		filter: filter,
		slug: slug
	} );
}

module.exports = {
	saveFilterAndSlug: saveFilterAndSlug
};
