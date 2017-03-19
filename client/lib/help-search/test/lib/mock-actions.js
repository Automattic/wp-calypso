var helpLinks = require( './mock-help-links' ),
	ActionTypes = require( 'lib/help-search/constants' ).action;

export default {
	fetchedHelpLinks: {
		type: ActionTypes.SET_HELP_LINKS,
		helpLinks: helpLinks
	}
};
