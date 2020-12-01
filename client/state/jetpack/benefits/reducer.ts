/**
 * Internal dependencies
 */
import { keyedReducer } from 'calypso/state/utils';
import { JETPACK_BENEFITS_UPDATE } from 'calypso/state/action-types';

import type { JetpackBenefitsAction } from './types';

export const benefitsReducer = keyedReducer(
	'siteId',
	( state = {}, action: JetpackBenefitsAction ) => {
		switch ( action.type ) {
			case JETPACK_BENEFITS_UPDATE: {
				return { ...state, ...action.benefits };
			}
		}
		return state;
	}
);

export default benefitsReducer;
