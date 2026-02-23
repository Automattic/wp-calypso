import { createElement, useEffect } from '@wordpress/element';
import { check, copy, Icon } from '@wordpress/icons';
import type { UseAgentChatReturn, UIMessage } from '@automattic/agenttic-client';

type RegisterMessageActions = UseAgentChatReturn[ 'registerMessageActions' ];

/**
 * Returns the copyable text from a message, or an empty string if not copyable.
 * Only plain-text agent messages (no `component`, `context`, or tool parts) qualify.
 */
function getCopyableText( message: UIMessage ): string {
	if ( ! message.content?.every( ( part ) => part.type === 'text' ) ) {
		return '';
	}

	// Exclude tool messages (JSON text with a `tool_id` field).
	try {
		if ( JSON.parse( message.content[ 0 ]?.text ?? '' ).tool_id ) {
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
 * Registers a "Copy" action on agent messages that copies the text content to the clipboard.
 */
export default function useCopy( registerMessageActions: RegisterMessageActions ): void {
	useEffect( () => {
		let copiedId: string | null = null;
		let timer: ReturnType< typeof setTimeout >;

		const getActions = ( message: UIMessage ) => {
			if ( message.role !== 'agent' ) {
				return [];
			}

			const text = getCopyableText( message );
			if ( ! text ) {
				return [];
			}

			const isCopied = copiedId === message.id;

			return [
				{
					id: 'copy',
					label: isCopied ? 'Copied' : 'Copy',
					disabled: isCopied,
					icon: createElement( Icon, {
						icon: isCopied ? check : copy,
						className:
							'agents-manager-message-action-icon agents-manager-message-action-icon--copy',
					} ),
					onClick: () => {
						navigator.clipboard.writeText( text );

						copiedId = message.id;
						registerMessageActions( { id: 'agents-manager-copy', actions: getActions } );

						timer = setTimeout( () => {
							copiedId = null;
							registerMessageActions( {
								id: 'agents-manager-copy',
								actions: getActions,
							} );
						}, 2000 );
					},
				},
			];
		};

		registerMessageActions( {
			id: 'agents-manager-copy',
			actions: getActions,
		} );

		return () => {
			clearTimeout( timer );
		};
	}, [ registerMessageActions ] );
}
