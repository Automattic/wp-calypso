/**
 * Internal dependencies
 */
import { getPreference } from 'calypso/state/preferences/selectors';

import 'calypso/state/guided-tours/init';

export default ( state ) => getPreference( state, 'guided-tours-history' );
