/**
 * Internal dependencies
 */
import { HOME_SET } from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const home = ( state = {}, { type, homeData } ) => ( type === HOME_SET ? homeData : state );

export default keyedReducer( 'siteId', home );
