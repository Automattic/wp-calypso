/**
 * Internal dependencies
 */
import { SIGNUP_STEPS_JPO_SUMMARY_SET } from 'state/action-types';

export function setJPOSummary( summary ) {
	return {
		type: SIGNUP_STEPS_JPO_SUMMARY_SET,
		summary
	};
}