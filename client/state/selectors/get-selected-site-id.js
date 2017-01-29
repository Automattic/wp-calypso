/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns selected site id or null if no site is selected
 *
 * @param  {Object}   state  Global state tree
 * @return {?Boolean}        Whether site is a Domain-only site
 */
const getSelectedSiteId = ( state ) => get( state, 'ui.selectedSiteId', null );

export default getSelectedSiteId;
