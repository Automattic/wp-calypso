/** @format */
/**
 * External dependencies
 */
import { get, has } from 'lodash';

export default status => ( importItems, { importerId } ) => ( {
	...importItems,
	// It's important that we check for an existing item first
	// else we could create a new entry with only { importerState }
	...( has( importItems, importerId ) && {
		[ importerId ]: {
			...get( importItems, importerId, {} ),
			importerState: status,
		},
	} ),
} );
