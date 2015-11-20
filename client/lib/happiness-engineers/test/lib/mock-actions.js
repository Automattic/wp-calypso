var happinessEngineers = require( './mock-happiness-engineers' ),
	ActionTypes = require( 'lib/happiness-engineers/constants' ).action;

module.exports = {
	fetchedHappinessEngineers: {
		type: ActionTypes.SET_HAPPPINESS_ENGINEERS,
		happinessEngineers: happinessEngineers
	}
};
