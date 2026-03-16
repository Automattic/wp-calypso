import { createElement, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { copy, Icon } from '@wordpress/icons';
import type { UseAgentChatReturn, UIMessage } from '@automattic/agenttic-client';

type RegisterMessageActions = UseAgentChatReturn[ 'registerMessageActions' ];

/**
 * Returns the copyable text from a message, or an empty string if not copyable.
 * Only plain-text agent messages (no `component`, `context`, or tool parts) qualify.
 */
function getCopyableText( message: UIMessage ): string {
	const hasNonTextParts = ! message.content?.every( ( part ) => part.type === 'text' );
	if ( hasNonTextParts ) {
		return '';
	}

	// Exclude tool messages (JSON text with a `tool_id` field).
	const firstPartText = message.content[ 0 ]?.text ?? '';
	try {
		const parsed = JSON.parse( firstPartText );

		// Tools with copyable text.
		if ( parsed.tool_id ) {
			if (
				parsed.tool_id === 'big_sky__wordpress_com_support' &&
				typeof parsed.data === 'string'
			) {
				return parsed.data.trim();
			}

			if (
				parsed.tool_id === 'big_sky__apply_block_edits' &&
				typeof parsed.data?.summary === 'string'
			) {
				return parsed.data.summary.trim();
			}

			return '';
		}
	} catch {
		// Not JSON — regular text.
	}

	return message.content
		.map( ( part ) => part.text ?? '' )
		.join( '\n' )
		.trim();
}

/**
 * Registers a copy action on agent messages that copies the text content to the clipboard.
 */
export default function useCopyAction( registerMessageActions: RegisterMessageActions ): void {
	useEffect( () => {
		registerMessageActions( {
			id: 'agents-manager-copy',
			actions: ( message: UIMessage ) => {
				if ( message.role !== 'agent' ) {
					return [];
				}

				const text = getCopyableText( message );

				if ( ! text ) {
					return [];
				}

				return [
					{
						id: 'copy',
						label: __( 'Copy', '__i18n_text_domain__' ),
						icon: createElement( Icon, {
							icon: copy,
							className:
								'agents-manager-message-action-icon agents-manager-message-action-icon--copy',
						} ),
						onClick: async () => {
							try {
								await navigator.clipboard.writeText( text );
							} catch ( error ) {
								// eslint-disable-next-line no-console
								console.error( '[useCopyAction] Failed to copy text to clipboard:', error );
							}
						},
					},
				];
			},
		} );
	}, [ registerMessageActions ] );
}
