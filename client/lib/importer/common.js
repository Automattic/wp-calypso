import find from 'lodash/find';
import { fromJS } from 'immutable';

import { appStates } from 'state/imports/constants';

// Left( UI ) - Right( API )
const importerStateMap = [
	[ appStates.CANCEL_PENDING, 'cancel' ],
	[ appStates.DEFUNCT, 'importStopped' ],
	[ appStates.DISABLED, 'disabled' ],
	[ appStates.EXPIRE_PENDING, 'expire' ],
	[ appStates.IMPORT_FAILURE, 'importFailure' ],
	[ appStates.IMPORT_SUCCESS, 'importSuccess' ],
	[ appStates.IMPORTING, 'importing' ],
	[ appStates.INACTIVE, 'importer-inactive' ],
	[ appStates.MAP_AUTHORS, 'importer-map-authors' ],
	[ appStates.READY_FOR_UPLOAD, 'importer-ready-for-upload' ],
	[ appStates.UPLOAD_SUCCESS, 'uploadSuccess' ],
	[ appStates.UPLOAD_FAILURE, 'importer-upload-failure' ],
	[ appStates.UPLOADING, 'importer-uploading' ]
];

function apiToAppState( state ) {
	return find(
		importerStateMap,
		( [ , api ] ) => api === state
	)[0];
}

function appStateToApi( state ) {
	return find(
		importerStateMap,
		( [ appState ] ) => appState === state
	)[1];
}

function generateSourceAuthorIds( customData ) {
	if ( ! customData.sourceAuthors ) {
		return customData;
	}

	return Object.assign( {}, customData, { sourceAuthors: customData
		.sourceAuthors
		.map( author => author.id ? author : Object.assign( {}, author, { id: author.login } ) )
	} );
}

function replaceUserInfoWithIds( customData ) {
	if ( ! customData.sourceAuthors ) {
		return customData;
	}

	return Object.assign( {}, customData, { sourceAuthors: customData
		.sourceAuthors
		.map( author => author.mappedTo ? Object.assign( {}, author, {
			mappedTo: author.mappedTo.ID
		} ) : author )
	} );
}

export function fromApi( state ) {
	const { importId: importerId, importStatus, type, progress, customData, siteId } = state;

	return {
		importerId,
		importerState: apiToAppState( importStatus ),
		type: `importer-type-${ type }`,
		progress: fromJS( progress ),
		customData: fromJS( generateSourceAuthorIds( customData ) ),
		site: { ID: siteId }
	};
}

export function toApi( state ) {
	const { importerId, site, type, importerState, customData, progress = undefined } = state;

	return Object.assign( {},
		{ importerId, progress },
		{ importStatus: appStateToApi( importerState ) },
		site && site.ID ? { siteId: site.ID } : {},
		type && { type: type.replace( 'importer-type-', '' ) },
		customData ? { customData: replaceUserInfoWithIds( customData ) } : {}
	);
}
