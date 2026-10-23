import { parseApprovalRequest } from '@automattic/agenttic-client';
import { ActionApproval } from '../components/action-approval';
import type { AgentsManagerUIMessage } from './convert-tool-messages-to-components';
import type { ActionApprovalProps } from '../components/action-approval';

export function convertActionApprovalMessages(
	messages: AgentsManagerUIMessage[],
	cards: Array< { id: string; props: ActionApprovalProps } >
): AgentsManagerUIMessage[] {
	const remaining = new Map( cards.map( ( card ) => [ card.id, card ] ) );
	const transcript: AgentsManagerUIMessage[] = [];
	const insertCard = ( id: string, timestamp: number ) => {
		const card = remaining.get( id );
		if ( ! card ) {
			return;
		}
		remaining.delete( id );
		transcript.push( {
			id,
			role: 'agent',
			timestamp,
			archived: false,
			showIcon: false,
			content: [ { type: 'component', component: ActionApproval, componentProps: card.props } ],
		} );
	};
	for ( const message of messages ) {
		const content = message.content.filter(
			( item ) => ! ( item.type === 'data' && item.data && 'approvalRequest' in item.data )
		);
		if ( content.length ) {
			transcript.push( { ...message, content } );
		}
		insertCard( message.id, message.timestamp );
		for ( const item of message.content ) {
			if ( item.type === 'data' && item.data && 'approvalRequest' in item.data ) {
				const request = parseApprovalRequest( item.data.approvalRequest );
				if ( request ) {
					insertCard( `approval:${ request.proposalId }`, message.timestamp );
				}
			}
		}
	}
	for ( const id of remaining.keys() ) {
		insertCard( id, 0 );
	}
	return transcript;
}
