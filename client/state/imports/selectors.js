/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';

/**
 * Redux dependencies
 */
import 'calypso/state/imports/init';

export function isImporterLocked( state, importerId ) {
	return state.imports.importerLocks[ importerId ] ?? false;
}

export function isImporterStatusHydrated( state ) {
	return state.imports.isImporterStatusHydrated;
}

export function getImporterStatus( state, importerId ) {
	return state.imports.importerStatus[ importerId ] ?? null;
}

export const getImporterStatusForSiteId = createSelector(
	( state, siteId ) => {
		return Object.values( state.imports.importerStatus ).filter(
			( importer ) => importer.site.ID === siteId
		);
	},
	( state ) => [ state.imports.importerStatus ]
);
