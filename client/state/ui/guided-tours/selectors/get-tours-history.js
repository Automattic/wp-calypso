/**
 * Internal dependencies
 */
import { getPreference } from 'state/preferences/selectors';

export default ( state ) => getPreference( state, 'guided-tours-history' );
