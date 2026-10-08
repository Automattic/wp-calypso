import { RegenerateAltIcon } from '@automattic/agenttic-ui';
import { createElement, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { UIMessage } from '@automattic/agenttic-client';
import type { MessageAction } from '@automattic/agenttic-ui/dist/types';

const REGENERATE_ACTION_ORDER = 3.5;

type RegenerateHandlerGetter = (
	message?: UIMessage
) => ( () => void | Promise< void > ) | null | undefined;

interface UseRegenerateActionConfig {
	enabled: boolean;
	getRegenerateHandler?: RegenerateHandlerGetter;
}

interface RegenerateActionOptions {
	/** Whether this message is the most recent agent message. */
	isLatestAgentMessage: boolean;
}

/**
 * Builds Agenttic's built-in regenerate action for a given agent message.
 *
 * Only the latest agent message can be regenerated, and only once its response
 * has finished streaming (agenttic exposes a handler for the completed turn).
 */
export default function useRegenerateAction( {
	enabled,
	getRegenerateHandler,
}: UseRegenerateActionConfig ): (
	message: UIMessage,
	options: RegenerateActionOptions
) => MessageAction[] {
	return useCallback(
		( message: UIMessage, { isLatestAgentMessage }: RegenerateActionOptions ) => {
			if ( ! enabled ) {
				return [];
			}

			const onRegenerate =
				typeof getRegenerateHandler === 'function' ? getRegenerateHandler( message ) : null;

			if ( ! onRegenerate ) {
				return [];
			}

			return [
				{
					id: 'regenerate',
					label: __( 'Regenerate', __i18n_text_domain__ ),
					tooltip: __( 'Regenerate response', __i18n_text_domain__ ),
					icon: createElement( RegenerateAltIcon, {
						className: 'agents-manager-message-action-icon',
					} ),
					order: REGENERATE_ACTION_ORDER,
					disabled: ! isLatestAgentMessage,
					onClick: onRegenerate,
					visibility: 'latest-turn',
				},
			];
		},
		[ enabled, getRegenerateHandler ]
	);
}
