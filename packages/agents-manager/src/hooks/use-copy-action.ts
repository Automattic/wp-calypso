import { useEffect } from '@wordpress/element';
import CopyActionButton from '../components/copy-action-button';
import type { UseAgentChatReturn, UIMessage } from '@automattic/agenttic-client';

type RegisterMessageActions = UseAgentChatReturn[ 'registerMessageActions' ];

function getToolMessageText( data: unknown ): string | undefined {
	if ( typeof data !== 'object' || data === null ) {
		return undefined;
	}

	const toolData = data as {
		summary?: unknown;
		result?: {
			message?: unknown;
		};
	};

	if ( typeof toolData.summary === 'string' && toolData.summary.trim() ) {
		return toolData.summary.trim();
	}

	if ( typeof toolData.result?.message === 'string' && toolData.result.message.trim() ) {
		return toolData.result.message.trim();
	}

	return undefined;
}

/**
 * Extracts copyable text from a message. For tool messages, only known tools with
 * displayable content are included. Returns an empty string if nothing is copyable.
 */
function getCopyableText( message: UIMessage ): string {
	const textParts = message.content?.filter( ( part ) => part.type === 'text' );
	if ( ! textParts?.length ) {
		return '';
	}

	const copyableTexts: string[] = [];

	for ( const part of textParts ) {
		const text = part.text ?? '';

		try {
			const parsed = JSON.parse( text );

			// Tool messages (JSON text with a `tool_id` field).
			if ( parsed.tool_id ) {
				if (
					parsed.tool_id === 'big_sky__wordpress_com_support' &&
					typeof parsed.data === 'string'
				) {
					copyableTexts.push( parsed.data.trim() );
				} else if (
					parsed.tool_id === 'big_sky__apply_block_edits' ||
					parsed.tool_id === 'big_sky__apply_update_theme'
				) {
					const toolMessageText = getToolMessageText( parsed.data );
					if ( toolMessageText ) {
						copyableTexts.push( toolMessageText );
					}
				}
				// Other tools: skip (not copyable).
				continue;
			}
		} catch {
			// Not JSON — regular text.
		}

		copyableTexts.push( text );
	}

	return copyableTexts.join( '\n' ).trim();
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
						type: 'component',
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
