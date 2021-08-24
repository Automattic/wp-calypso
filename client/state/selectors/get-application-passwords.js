import { get } from 'lodash';

import 'calypso/state/application-passwords/init';

/**
 * Returns the application passwords of the current user.
 *
 * @param  {object} state Global state tree
 * @returns {Array}        Application passwords
 */
export default ( state ) => get( state, [ 'applicationPasswords', 'items' ], [] );
