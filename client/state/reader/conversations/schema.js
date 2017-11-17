/** @format */

/**
 * Internal dependencies
 */
import {
	CONVERSATION_FOLLOW_STATUS_FOLLOWING,
	CONVERSATION_FOLLOW_STATUS_NOT_FOLLOWING,
	CONVERSATION_FOLLOW_STATUS_MUTING,
} from './follow-status';

/* eslint-disable quote-props */
export const itemsSchema = {
	type: 'object',
	patternProperties: {
		'^[0-9]+-[0-9]+$': {
			enum: [
				CONVERSATION_FOLLOW_STATUS_FOLLOWING,
				CONVERSATION_FOLLOW_STATUS_NOT_FOLLOWING,
				CONVERSATION_FOLLOW_STATUS_MUTING,
			],
		},
	},
	additionalProperties: false,
};
/* eslint-enable quote-props */
