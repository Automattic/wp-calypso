import { RegenerateAltIcon } from '@automattic/agenttic-ui';
import { createElement, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import type { UIMessage, UseAgentChatReturn } from '@automattic/agenttic-client';

const REGENERATE_ACTION_REGISTRATION_ID = 'agents-manager-regenerate';
const REGENERATE_ACTION_ORDER = 3.5;

interface UseRegenerateActionConfig {
	enabled: boolean;
	isProcessing: boolean;
	registerMessageActions: UseAgentChatReturn[ 'registerMessageActions' ];
	unregisterMessageActions: UseAgentChatReturn[ 'unregisterMessageActions' ];
	getRegenerateHandler: UseAgentChatReturn[ 'getRegenerateHandler' ];
}

/**
 * Registers Agenttic's built-in regenerate action in AM's message action row.
 */
export default function useRegenerateAction( {
	enabled,
	isProcessing,
	registerMessageActions,
	unregisterMessageActions,
	getRegenerateHandler,
}: UseRegenerateActionConfig ): void {
	useEffect( () => {
		if ( ! enabled ) {
			unregisterMessageActions( REGENERATE_ACTION_REGISTRATION_ID );
			return;
		}

		registerMessageActions( {
			id: REGENERATE_ACTION_REGISTRATION_ID,
			actions: ( message: UIMessage ) => {
				const onRegenerate = getRegenerateHandler( message );

				return onRegenerate
					? [
							{
								id: 'regenerate',
								label: __( 'Regenerate', '__i18n_text_domain__' ),
								tooltip: __( 'Regenerate response', '__i18n_text_domain__' ),
								icon: createElement( RegenerateAltIcon, {
									className: 'agents-manager-message-action-icon',
								} ),
								order: REGENERATE_ACTION_ORDER,
								onClick: onRegenerate,
							},
					  ]
					: [];
			},
		} );

		return () => {
			unregisterMessageActions( REGENERATE_ACTION_REGISTRATION_ID );
		};
	}, [
		enabled,
		getRegenerateHandler,
		isProcessing,
		registerMessageActions,
		unregisterMessageActions,
	] );
}
