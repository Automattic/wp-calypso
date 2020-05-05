/**
 * Internal dependencies
 */
import { LEGAL_REQUEST, LEGAL_SET, TOS_ACCEPT } from 'state/action-types';
import 'state/data-layer/wpcom/legal';

export const requestLegalData = () => ( {
	type: LEGAL_REQUEST,
} );

export const setLegalData = ( legalData ) => ( {
	type: LEGAL_SET,
	legalData,
} );

export const acceptTos = () => ( {
	type: TOS_ACCEPT,
} );
