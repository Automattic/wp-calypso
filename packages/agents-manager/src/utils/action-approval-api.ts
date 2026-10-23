import { normalizeApprovalMessages, parseApprovalRequest } from '@automattic/agenttic-client';
import { API_BASE_URL } from '../constants';
import type {
	ApprovalRequest,
	AuthProvider,
	Message,
	ServerLoadResult,
} from '@automattic/agenttic-client';
import type { ApprovalDecision } from '@automattic/agenttic-ui';

async function approvalFetch(
	path: string,
	authProvider: AuthProvider | undefined,
	options: RequestInit
): Promise< unknown > {
	if ( ! authProvider ) {
		throw new Error( 'Approval authentication is unavailable' );
	}
	const headers = await authProvider();
	if ( options.signal?.aborted ) {
		throw new DOMException( 'Approval request cancelled', 'AbortError' );
	}
	const response = await fetch( `${ API_BASE_URL }/wpcom/v2/ai/approvals${ path }`, {
		...options,
		headers: { 'Content-Type': 'application/json', ...headers },
	} );
	if ( ! response.ok ) {
		throw new Error( `Approval request failed (${ response.status })` );
	}
	return response.json();
}

export async function postApprovalDecision(
	request: ApprovalRequest,
	decision: ApprovalDecision,
	authProvider: AuthProvider | undefined,
	signal: AbortSignal
): Promise< { request: ApprovalRequest; alreadyDecided: boolean } > {
	const value = await approvalFetch(
		`/${ encodeURIComponent( request.proposalId ) }`,
		authProvider,
		{
			method: 'POST',
			body: JSON.stringify( { decision, chatId: request.chatId } ),
			signal,
		}
	);
	if (
		! value ||
		typeof value !== 'object' ||
		! ( 'proposalId' in value ) ||
		value.proposalId !== request.proposalId ||
		! ( 'state' in value )
	) {
		throw new Error( 'Invalid approval decision response' );
	}
	const updated = parseApprovalRequest( { ...request, state: value.state } );
	if ( ! updated || updated.state === 'pending' ) {
		throw new Error( 'Approval decision was not recorded' );
	}
	return {
		request: updated,
		alreadyDecided: 'already_decided' in value && value.already_decided === true,
	};
}

export async function loadActionApprovals(
	chatId: number,
	authProvider: AuthProvider | undefined,
	signal?: AbortSignal
): Promise< ApprovalRequest[] > {
	if ( ! Number.isSafeInteger( chatId ) || chatId <= 0 ) {
		throw new Error( 'Approval history requires a numeric chat ID' );
	}
	const value = await approvalFetch( `?chat_id=${ chatId }`, authProvider, {
		method: 'GET',
		signal,
	} );
	if (
		! value ||
		typeof value !== 'object' ||
		! ( 'proposals' in value ) ||
		! Array.isArray( value.proposals )
	) {
		throw new Error( 'Invalid approval history response' );
	}
	return value.proposals.map( ( proposal ) => {
		const request = parseApprovalRequest( proposal );
		if ( ! request || request.chatId !== chatId ) {
			throw new Error( 'Invalid approval history record' );
		}
		return request;
	} );
}

export function approvalRequestsToMessages( requests: ApprovalRequest[] ): Message[] {
	return requests.map( ( approvalRequest ) => ( {
		messageId: `approval:${ approvalRequest.proposalId }`,
		kind: 'message',
		role: 'agent',
		parts: [ { type: 'data', data: { approvalRequest } } ],
	} ) );
}

/** Merge page-independent approval records before browser recovery can inspect history. */
export function restoreConversationApprovals( loaded: ServerLoadResult ): ServerLoadResult {
	if ( ! loaded.approvals?.length ) {
		return loaded;
	}
	return {
		...loaded,
		messages: normalizeApprovalMessages( [
			...loaded.messages,
			...approvalRequestsToMessages( loaded.approvals ),
		] ),
	};
}
