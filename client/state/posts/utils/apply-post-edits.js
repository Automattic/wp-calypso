import { mergeWith } from 'lodash';

/*
 * Applies a metadata edit operation (either update or delete) to an existing array of
 * metadata values.
 */
function applyMetadataEdit( metadata, edit ) {
	switch ( edit.operation ) {
		case 'update': {
			// Either update existing key's value or append a new one at the end
			const { key, value } = edit;
			if ( ( Array.isArray( metadata ) ? metadata : [] ).find( ( m ) => m.key === key ) ) {
				return metadata.map( ( m ) => ( m.key === key ? { key, value } : m ) );
			}
			return ( Array.isArray( metadata ) ? metadata : [] ).concat( { key, value } );
		}
		case 'delete': {
			// Remove a value from the metadata array. If the key is not present,
			// return unmodified original value.
			const { key } = edit;
			if ( ( Array.isArray( metadata ) ? metadata : [] ).find( ( m ) => m.key === key ) ) {
				return ( Array.isArray( metadata ) ? metadata : [] ).filter( ( m ) => m.key !== key );
			}
			return metadata;
		}
	}

	return metadata;
}

function applyMetadataEdits( metadata, edits ) {
	return ( edits ?? [] ).reduce( applyMetadataEdit, metadata );
}

/**
 * Merges edits into a post object. Essentially performs a deep merge of two objects,
 * except that arrays are treated as atomic values and overwritten rather than merged.
 * That's important especially for term removals.
 * @param  {Object} post  Destination post for merge
 * @param  {Object} edits Objects with edits
 * @returns {Object}       Merged post with applied edits
 */
export function applyPostEdits( post, edits ) {
	return mergeWith(
		structuredClone( post ),
		edits,
		( objValue, srcValue, key, obj, src, stack ) => {
			// Merge metadata specially. Only a `metadata` key at top level gets special treatment,
			// keys with the same name in nested objects do not.
			if ( key === 'metadata' && stack.size === 0 ) {
				return applyMetadataEdits( objValue, srcValue );
			}

			if ( Array.isArray( srcValue ) ) {
				return srcValue;
			}
		}
	);
}
