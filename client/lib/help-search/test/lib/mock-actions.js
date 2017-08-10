/** @format */
var helpLinks = require( './mock-help-links' ),
	ActionTypes = require( 'lib/help-search/constants' ).action;

module.exports = {
	fetchedHelpLinks: {
		type: ActionTypes.SET_HELP_LINKS,
		helpLinks: helpLinks,
	},
};
