/**
 * Internal dependencies
 */
import { getPreference } from 'state/preferences/selectors';

import 'state/guided-tours/init';

export default ( state ) => getPreference( state, 'guided-tours-history' );
