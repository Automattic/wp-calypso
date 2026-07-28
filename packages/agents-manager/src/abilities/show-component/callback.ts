import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { BIG_SKY_SHOW_COMPONENT_TOOL_ID } from '../../utils/show-component-tools';
import type { AbilityResult } from '../types';
import type { ShowComponentType } from './index';

export interface ShowComponentInput {
	type: ShowComponentType;
	props: Record< string, unknown >;
	summary?: string;
	followUpTasks?: boolean;
}

/**
 * The `show-component` ability callback.
 * Returns a JSON `agentMessage` for `convertToolMessagesToComponents()`.
 */
export async function showComponentCallback( input: ShowComponentInput ): Promise< AbilityResult > {
	const { type, props = {}, summary, followUpTasks } = input;

	if ( ! props || typeof props !== 'object' || Object.keys( props ).length === 0 ) {
		// eslint-disable-next-line no-console
		console.error( `[AgentsManager] Invalid props for component ${ type }` );

		return {
			result: {
				success: false,
				message: __(
					'There was an error with this request. Please try again.',
					__i18n_text_domain__
				),
				error: 'Props must be an object with properties',
			},
			returnToAgent: true,
		};
	}

	// Read at call time so the picker records the page it was shown on.
	const currentPostId = (
		select( 'core/editor' ) as { getCurrentPostId?: () => number } | undefined
	 )?.getCurrentPostId?.();

	const successMessage =
		( typeof summary === 'string' && summary.trim() ) ||
		__( 'Choose from the options I provided.', __i18n_text_domain__ );

	return {
		result: {
			success: true,
			message: successMessage,
			details: { type },
		},
		// The picker renders from the structured `agentMessage`, while the
		// tool result tells the agent the picker was shown.
		returnToAgent: true,
		agentMessage: JSON.stringify( {
			tool_id: BIG_SKY_SHOW_COMPONENT_TOOL_ID,
			data: {
				type,
				props,
				followUpTasks,
				summary: successMessage,
				isCurrent: true,
				postId: currentPostId,
			},
		} ),
	};
}
