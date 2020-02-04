/**
 * Internal dependencies
 */
import { LEGAL_REQUEST, LEGAL_SET } from 'state/action-types';
import 'state/data-layer/wpcom/legal';

export const requestLegalData = () => ( {
	type: LEGAL_REQUEST,
} );

export const setLegalData = legalData => ( {
	type: LEGAL_SET,
	legalData,
} );
