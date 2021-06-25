/**
 * External dependencies
 */
import { get } from 'lodash';

import 'calypso/state/connected-applications/init';

/**
 * Returns the connected applications of the current user.
 *
 * @param  {object} state Global state tree
 * @returns {?Array}       Connected applications
 */
export default ( state ) => get( state, 'connectedApplications', null );
