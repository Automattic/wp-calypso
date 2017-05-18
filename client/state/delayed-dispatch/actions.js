/**
 * Internal dependencies
 */
import { DELAYED_DISPATCH } from '../action-types';

export const delayDispatch = ( delay, payload, message = '' ) => Object.assign(
	{
		type: DELAYED_DISPATCH,
		payload,
		delay,
		dispatchBy: Date.now() + delay,
	},
	message && { message }
);
