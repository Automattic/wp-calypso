/**
 * Internal dependencies
 */
import 'calypso/state/imports/init';

export function isLoading( state ) {
	return state.imports.siteImporter?.isLoading;
}

export function getError( state ) {
	return state.imports.siteImporter?.error;
}

export function getImportData( state ) {
	return state.imports.siteImporter?.importData;
}

export function getImportStage( state ) {
	return state.imports.siteImporter?.importStage;
}

export function getValidatedSiteUrl( state ) {
	return state.imports.siteImporter?.validatedSiteUrl;
}
