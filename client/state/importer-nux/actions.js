/** @format */
/**
 * Internal dependencies
 */
import { IMPORTER_NUX_URL_INPUT_SET } from 'state/action-types';

export const setNuxUrlInputValue = value => ( {
	type: IMPORTER_NUX_URL_INPUT_SET,
	value,
} );
