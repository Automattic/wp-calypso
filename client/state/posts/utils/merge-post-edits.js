/**
 * External dependencies
 */
import { cloneDeep, concat, find, isString, mergeWith, reduce, reject } from 'lodash';

function mergeMetadataEdits( edits, nextEdits ) {
	// remove existing edits that get updated in `nextEdits`
	const newEdits = reject( edits, ( edit ) => find( nextEdits, { key: edit.key } ) );
	// append the new edits at the end
	return concat( newEdits, nextEdits );
}

/**
 * Merges an array of post edits (called 'edits log') into one object. Essentially performs
 * a repeated deep merge of two objects, except:
 * - arrays are treated as atomic values and overwritten rather than merged.
 *   That's important especially for term removals.
 * - metadata edits, which are also arrays, are merged with a special algorithm.
 *
 * @param  {Array<object>} postEditsLog Edits objects to be merged
 * @returns {object?}                    Merged edits object with changes from all sources
 */
export const mergePostEdits = ( ...postEditsLog ) =>
	reduce(
		postEditsLog,
		( mergedEdits, nextEdits ) => {
			// filter out save markers
			if ( isString( nextEdits ) ) {
				return mergedEdits;
			}

			// return the input object if it's the first one to merge (optimization that avoids cloning)
			if ( mergedEdits === null ) {
				return nextEdits;
			}

			// proceed to do the merge
			return mergeWith(
				cloneDeep( mergedEdits ),
				nextEdits,
				( objValue, srcValue, key, obj, src, stack ) => {
					if ( key === 'metadata' && stack.size === 0 ) {
						// merge metadata specially
						return mergeMetadataEdits( objValue, srcValue );
					}

					if ( Array.isArray( srcValue ) ) {
						return srcValue;
					}
				}
			);
		},
		null
	);
