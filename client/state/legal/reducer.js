/**
 * Internal dependencies
 */
import { LEGAL_SET } from 'calypso/state/action-types';
import { withStorageKey } from 'calypso/state/utils';

const reducer = ( state = {}, { type, legalData } ) => ( type === LEGAL_SET ? legalData : state );
export default withStorageKey( 'legal', reducer );
