/**
 * External dependencies
 */
import { every, filter, find } from 'lodash';

function isUnappliedMetadataEdit( edit, savedMetadata ) {
	const savedRecord = find( savedMetadata, { key: edit.key } );

	// is an update already performed?
	if ( edit.operation === 'update' ) {
		return ! savedRecord || savedRecord.value !== edit.value;
	}

	// is a property already deleted?
	if ( edit.operation === 'delete' ) {
		return !! savedRecord;
	}

	return false;
}

/*
 * Returns edits that are not yet applied, i.e.:
 * - when updating, the property doesn't already have the desired value in `savedMetadata`
 * - when deleting, the property is still present in `savedMetadata`
 */
export function getUnappliedMetadataEdits( edits, savedMetadata ) {
	return filter( edits, ( edit ) => isUnappliedMetadataEdit( edit, savedMetadata ) );
}

export function areAllMetadataEditsApplied( edits, savedMetadata ) {
	return every( edits, ( edit ) => ! isUnappliedMetadataEdit( edit, savedMetadata ) );
}
