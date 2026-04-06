import { useEffect } from '@wordpress/element';
import CopyActionButton from '../components/copy-action-button';
import type { UseAgentChatReturn, UIMessage } from '@automattic/agenttic-client';

type RegisterMessageActions = UseAgentChatReturn[ 'registerMessageActions' ];

/**
 * Returns the copyable text from a message, or an empty string if not copyable.
 * Messages with at least one text part are copyable; non-text parts (e.g. `data`) are ignored.
 */
function getCopyableText( message: UIMessage ): string {
	const textParts = message.content?.filter( ( part ) => part.type === 'text' );
	if ( ! textParts?.length ) {
		return '';
	}

	// Exclude tool messages (JSON text with a `tool_id` field).
	const firstPartText = textParts[ 0 ]?.text ?? '';
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

	return textParts
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
						type: 'component' as const,
						id: 'copy',
						component: CopyActionButton,
						componentProps: { text },
						order: 4,
					},
				];
			},
		} );
	}, [ registerMessageActions ] );
}
