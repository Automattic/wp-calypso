/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { LEGAL_SET } from 'calypso/state/action-types';

const reducer = ( state = {}, { type, legalData } ) => ( type === LEGAL_SET ? legalData : state );
export default withStorageKey( 'legal', reducer );
