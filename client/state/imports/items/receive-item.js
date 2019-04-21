/** @format */
/**
 * External dependencies
 */
import { includes, omitBy } from 'lodash';

/**
 * Internal dependencies
 */
import { appStates } from 'state/imports/constants';

const STALE_STATES = [ appStates.CANCEL_PENDING, appStates.DEFUNCT ];

export default ( importItems, { importerStatus = {}, isImporterLocked } ) =>
	isImporterLocked
		? // If it's locked, don't update this import item, just return the importItems
		  importItems
		: omitBy(
				{
					// filter the original set of importers...
					...importItems,
					// ...and the importer being received.
					[ importerStatus.importerId ]: importerStatus,
				},
				importer => includes( STALE_STATES, importer.importerState )
		  );
