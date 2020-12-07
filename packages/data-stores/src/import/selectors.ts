/**
 * Internal dependencies
 */
import type { State } from './reducer';

export const getState = ( state: State ) => state;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const validateSiteIsImportable = ( state: State, _: string ) => state.importableSiteData;
