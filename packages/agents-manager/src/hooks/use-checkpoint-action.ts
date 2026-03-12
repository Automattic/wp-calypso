import { createElement, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { undo, Icon } from '@wordpress/icons';
import type { UseCheckpointReturn } from '../utils/load-external-providers';
import type { UseAgentChatReturn, UIMessage } from '@automattic/agenttic-client';

type RegisterMessageActions = UseAgentChatReturn[ 'registerMessageActions' ];

/**
 * Gets the checkpoint ID embedded in a tool message, or an empty string
 * if the message doesn't contain one.
 *
 * Checkpoint IDs are not available in past or restored conversations
 * because they are only stored in-memory for the current session.
 */
function getCheckpointId( message: UIMessage ): string {
	const firstPartText = message.content?.[ 0 ]?.text ?? '';

	try {
		const parsed = JSON.parse( firstPartText );

		if ( parsed.data?.calypsoCheckpointId ) {
			return parsed.data.calypsoCheckpointId;
		}
	} catch {
		// Not JSON — not a tool message.
	}

	return '';
}

/**
 * Registers an undo action on agent messages that have a checkpoint.
 */
export default function useCheckpointAction(
	registerMessageActions: RegisterMessageActions,
	checkpoint?: UseCheckpointReturn
): void {
	useEffect( () => {
		if ( ! checkpoint ) {
			return;
		}

		registerMessageActions( {
			id: 'agents-manager-checkpoint',
			actions: ( message: UIMessage ) => {
				if ( message.role !== 'agent' ) {
					return [];
				}

				const checkpointId = getCheckpointId( message );

				if ( ! checkpointId || ! checkpoint.hasCheckpoint( checkpointId ) ) {
					return [];
				}

				return [
					{
						id: 'checkpoint',
						label: __( 'Undo', '__i18n_text_domain__' ),
						icon: createElement( Icon, {
							icon: undo,
							className: 'agents-manager-message-action-icon',
						} ),
						onClick: async () => {
							try {
								await checkpoint.restoreCheckpoint( checkpointId );
							} catch ( error ) {
								// eslint-disable-next-line no-console
								console.error( '[useCheckpointAction] Failed to restore checkpoint:', error );
							}
						},
					},
				];
			},
		} );
	}, [ registerMessageActions, checkpoint ] );
}
