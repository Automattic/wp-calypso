import { __ } from '@wordpress/i18n';
import { BIG_SKY_ABILITY_CATEGORY } from '../constants';
import { openHelpCenterCallback } from './callback';
import type { Ability } from '../types';

export { OPEN_HELP_CENTER_BUTTON_TYPE } from './callback';

/**
 * The `open-help-center` ability definition.
 *
 * Keeps the `big-sky/` name so the backend route allowlists keep matching.
 */
export const openHelpCenterAbility: Ability = {
	name: 'big-sky/open-help-center',
	label: __( 'Show Help Center chat button', __i18n_text_domain__ ),
	category: BIG_SKY_ABILITY_CATEGORY,
	description:
		'Show the user a button they can click to open WordPress.com Help Center chat when they ask to talk to a human, contact support, or get help from a person. This ability does not open Help Center automatically.',
	input_schema: {
		type: 'object',
		properties: {
			message: {
				type: 'string',
				description:
					'Initial message to send or prefill in the Support Assistant. Compose this message as if it was written by the user, using natural language and no technical jargon. This message MUST include a concise summary of the current conversation backscroll, what the user is trying to do, what has already been attempted, relevant site/editor context, and that the user wants to talk to a human support agent.',
			},
			summary: {
				type: 'string',
				description:
					"A short, friendly confirmation in the agent's own voice telling the user to click the button to open Help Center and talk to a human. Do NOT say that Help Center is opening, has opened, or is being opened automatically. This is separate from the Support Assistant message and should not include the full backscroll summary.",
			},
		},
		additionalProperties: false,
	},
	output_schema: {
		type: 'object',
		properties: {
			result: {
				type: 'object',
				properties: {
					success: { type: 'boolean' },
					message: {
						type: 'string',
						description: 'Human-readable confirmation or error message for the agent.',
					},
				},
				required: [ 'success', 'message' ],
			},
			returnToAgent: { type: 'boolean' },
			agentMessage: { type: 'string' },
		},
		required: [ 'result', 'returnToAgent' ],
	},
	callback: openHelpCenterCallback,
};
