/**
 * External dependencies
 */
import { values } from 'lodash';

/**
 * Internal dependencies
 */
import { CONVERSATION_FOLLOW_STATUS } from './follow-status';

/* eslint-disable quote-props */
export const itemsSchema = {
	type: 'object',
	patternProperties: {
		'^[0-9]+-[0-9]+$': {
			enum: values( CONVERSATION_FOLLOW_STATUS ),
		},
	},
	additionalProperties: false,
};
/* eslint-enable quote-props */
