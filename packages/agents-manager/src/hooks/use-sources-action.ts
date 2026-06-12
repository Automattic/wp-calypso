import { useEffect } from '@wordpress/element';
import SourcesDisplay from '../components/sources-display';
import type { UseAgentChatReturn, UIMessage } from '@automattic/agenttic-client';

type RegisterMessageActions = UseAgentChatReturn[ 'registerMessageActions' ];

interface Source {
	title: string;
	url: string;
	content?: string;
}

/**
 * Extracts the sources array from a message's data block, or returns null.
 */
function getMessageSources( message: UIMessage ): Source[] | null {
	for ( const block of message.content ?? [] ) {
		if (
			block.type === 'data' &&
			Array.isArray( block.data?.sources ) &&
			block.data.sources.length > 0
		) {
			return block.data.sources as Source[];
		}
	}
	return null;
}

/**
 * Registers the SourcesDisplay component as a message action on agent messages
 * that contain a sources data block.
 */
export default function useSourcesAction(
	registerMessageActions: RegisterMessageActions,
	enabled = true
): void {
	useEffect( () => {
		if ( ! enabled ) {
			return;
		}

		registerMessageActions( {
			id: 'agents-manager-sources',
			actions: ( message ) => {
				if ( message.role !== 'agent' ) {
					return [];
				}

				const sources = getMessageSources( message );

				if ( ! sources ) {
					return [];
				}

				return [
					{
						type: 'component',
						id: 'sources',
						label: 'Sources',
						component: SourcesDisplay,
						componentProps: { sources },
					},
				];
			},
		} );
	}, [ enabled, registerMessageActions ] );
}
