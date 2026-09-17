import { RegenerateAltIcon } from '@automattic/agenttic-ui';
import { createElement, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { UIMessage } from '@automattic/agenttic-client';
import type { MessageAction } from '@automattic/agenttic-ui/dist/types';

const REGENERATE_ACTION_ORDER = 3.5;

const noop = () => {};

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
	/** Whether a response is currently streaming. */
	isStreaming: boolean;
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
		( message: UIMessage, { isLatestAgentMessage, isStreaming }: RegenerateActionOptions ) => {
			if ( ! enabled ) {
				return [];
			}

			const onRegenerate =
				typeof getRegenerateHandler === 'function' ? getRegenerateHandler( message ) : null;

			// Show the icon when the turn is regeneratable, or as a disabled
			// placeholder on the latest message while its response is streaming.
			const showStreamingPlaceholder = isLatestAgentMessage && isStreaming && ! onRegenerate;
			if ( ! onRegenerate && ! showStreamingPlaceholder ) {
				return [];
			}

			// Enabled only for the latest agent message once its turn is complete.
			const isEnabled = isLatestAgentMessage && Boolean( onRegenerate );

			return [
				{
					id: 'regenerate',
					label: __( 'Regenerate', __i18n_text_domain__ ),
					tooltip: __( 'Regenerate response', __i18n_text_domain__ ),
					icon: createElement( RegenerateAltIcon, {
						className: 'agents-manager-message-action-icon',
					} ),
					order: REGENERATE_ACTION_ORDER,
					disabled: ! isEnabled,
					onClick: onRegenerate ?? noop,
				},
			];
		},
		[ enabled, getRegenerateHandler ]
	);
}
