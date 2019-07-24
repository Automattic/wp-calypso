/**
 * External dependencies
 */
import { get } from 'lodash';

export const isGutenbergSupported = ( state, siteId ) => {
	return get( state, [ 'gutenbergSupport', siteId ], false );
};

export default isGutenbergSupported;
