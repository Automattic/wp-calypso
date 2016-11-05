/**
 * Internal dependencies
 */
import requestPlans from './plans-request';
import { mergeHandlers } from 'state/data-layer/utils';

import {
	PLANS_REQUEST,
} from 'state/action-types';

export const handlers = mergeHandlers( {
	[ PLANS_REQUEST ]: requestPlans,
} );

export default handlers;
