import { getAgentManager } from '@automattic/agenttic-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from '@wordpress/element';
import { API_BASE_URL } from '../constants';
import { useAgentsManagerContext } from '../contexts';
import { AGENT_TURN_ENDED_EVENT } from '../utils/agent-activity-events';
import { getConversationBotId } from '../utils/conversation-bot-id';
import {
	getSitePanelItems,
	mergeSitePanelMessages,
	type SitePanelMessage,
} from '../utils/site-panel-content';
import { useSitePanelTitles } from './use-site-panel-titles';

const SNAPSHOT_INTERVAL_MS = 750;
const MAX_TRANSCRIPT_PAGES = 10;

/**
 * Observes the current runtime without creating a second chat. Raw history preserves
 * user context.url, which Agenttic's display-message conversion currently discards.
 */
export function useSitePanelContent() {
	const { agentConfig, site, siteKey, currentUser, getTabSessionId } = useAgentsManagerContext();
	const [ snapshot, setSnapshot ] = useState( {
		sessionId: getTabSessionId(),
		messages: [] as SitePanelMessage[],
	} );
	const [ revision, setRevision ] = useState( 0 );
	useEffect( () => {
		const update = () => {
			const manager = getAgentManager();
			const messages =
				agentConfig && manager.hasAgent( agentConfig.agentId )
					? manager.getConversationHistory( agentConfig.agentId ).map( ( message ) => ( {
							role: message.role,
							message_id:
								typeof message.metadata?.serverId === 'number'
									? message.metadata.serverId
									: undefined,
							timestamp:
								typeof message.metadata?.timestamp === 'number'
									? message.metadata.timestamp
									: undefined,
							content: message.parts
								.filter( ( part ) => part.type === 'text' )
								.map( ( part ) => part.text )
								.join( '\n' ),
						} ) )
					: [];
			const next = { sessionId: getTabSessionId(), messages };
			setSnapshot( ( previous ) =>
				JSON.stringify( previous ) === JSON.stringify( next ) ? previous : next
			);
		};
		const refresh = () => {
			update();
			setRevision( ( value ) => value + 1 );
		};
		update();
		const timer = window.setInterval( update, SNAPSHOT_INTERVAL_MS );
		window.addEventListener( AGENT_TURN_ENDED_EVENT, refresh );
		return () => {
			window.clearInterval( timer );
			window.removeEventListener( AGENT_TURN_ENDED_EVENT, refresh );
		};
	}, [ agentConfig, getTabSessionId ] );
	const {
		data = [],
		isError,
		error,
	} = useQuery( {
		queryKey: [
			'agents-manager-site-panel-transcript',
			siteKey,
			currentUser?.ID,
			agentConfig?.agentId,
			snapshot.sessionId,
			revision,
		],
		enabled: !! agentConfig && !! snapshot.sessionId && ! snapshot.sessionId.startsWith( 'local-' ),
		queryFn: async ( { signal } ): Promise< SitePanelMessage[] > => {
			const botId = getConversationBotId(
				agentConfig!.agentId,
				new URLSearchParams( window.location.search ).has( 'agent' )
			);
			const headers = await agentConfig!.authProvider?.();
			const messages: SitePanelMessage[] = [];
			for ( let page = 1; page <= MAX_TRANSCRIPT_PAGES; page++ ) {
				const response = await fetch(
					`${ API_BASE_URL }/wpcom/v2/odie/chat/${ encodeURIComponent( botId ) }/${ encodeURIComponent( snapshot.sessionId ) }?page_number=${ page }&items_per_page=100`,
					{ headers, signal }
				);
				if ( ! response.ok ) {
					throw new Error( 'Could not load referenced content.' );
				}
				const result: { messages: SitePanelMessage[]; metadata?: { total_pages: number } } =
					await response.json();
				messages.push( ...result.messages );
				if ( page >= ( result.metadata?.total_pages ?? 1 ) ) {
					break;
				}
			}
			return messages;
		},
	} );
	useEffect( () => {
		if ( error ) {
			// eslint-disable-next-line no-console
			console.error( '[AgentsManager] Could not load site panel references:', error );
		}
	}, [ error ] );
	return {
		items: useSitePanelTitles(
			getSitePanelItems(
				mergeSitePanelMessages( data, snapshot.messages ),
				site?.URL || `https://${ site?.domain }`
			)
		),
		isError,
	};
}
