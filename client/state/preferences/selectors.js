/** @format */
console.log( '[state/preferences/selectors]' );

/**
 * Internal dependencies
 */
import registry from 'state/wp-data/registry';
import { registerStore } from './index';

function isFetchingPreferences() {
	registerStore();
	return registry.select( 'calypso/preferences' ).isFetchingPreferences( ...arguments );
}

function getPreference() {
	registerStore();
	return registry.select( 'calypso/preferences' ).getPreference( ...arguments );
}

function getAllRemotePreferences() {
	registerStore();
	return registry.select( 'calypso/preferences' ).getPreference( ...arguments );
}

function preferencesLastFetchedTimestamp() {
	registerStore();
	return registry.select( 'calypso/preferences' ).getPreference( ...arguments );
}

function hasReceivedRemotePreferences() {
	registerStore();
	return registry.select( 'calypso/preferences' ).getPreference( ...arguments );
}

export {
	isFetchingPreferences,
	getPreference,
	getAllRemotePreferences,
	preferencesLastFetchedTimestamp,
	hasReceivedRemotePreferences,
};
