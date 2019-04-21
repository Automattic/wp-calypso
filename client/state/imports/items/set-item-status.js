/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

export default status => ( importItems, { importerId } ) => ( {
	...importItems,
	[ importerId ]: {
		...get( importItems, importerId, {} ),
		importerState: status,
	},
} );
