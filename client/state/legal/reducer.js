/**
 * Internal dependencies
 */
import { LEGAL_SET } from 'state/action-types';

export default ( state = {}, { type, legalData } ) => ( type === LEGAL_SET ? legalData : state) ;
