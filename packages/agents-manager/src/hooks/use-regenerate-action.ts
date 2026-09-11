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

/**
 * Builds Agenttic's built-in regenerate action for an agent message, for
 * providers that opt in. Agenttic hands out a handler for any agent message it
 * can rebuild history up to, older turns included, so this builder is not a
 * guard on its own: the transcript's turn policy (`applyTurnActionPolicy`) is
 * what keeps the action on the latest turn's reply. Never render its output
 * without it.
 */
export default function useRegenerateAction( {
	enabled,
	getRegenerateHandler,
}: UseRegenerateActionConfig ): ( message: UIMessage ) => MessageAction[] {
	return useCallback(
		( message: UIMessage ) => {
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
					onClick: onRegenerate,
				},
			];
		},
		[ enabled, getRegenerateHandler ]
	);
}
