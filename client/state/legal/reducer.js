/**
 * Internal dependencies
 */
import { LEGAL_SET } from 'state/action-types';
import { withStorageKey } from 'state/utils';

const reducer = ( state = {}, { type, legalData } ) => ( type === LEGAL_SET ? legalData : state );
export default withStorageKey( 'legal', reducer );
