import wpcom from 'calypso/lib/wp';

export type AgentHandoffStatus = {
	handoff_id: string;
	state: string;
	site_id: number | null;
	safe_close: boolean;
	next_action: string;
};

export function getAgentHandoffId( query: URLSearchParams ): string | null {
	const values = query.getAll( 'agentHandoffId' );
	if ( values.length === 0 ) {
		return null;
	}
	if ( values.length !== 1 || ! /^sbh_[a-f0-9]{24}$/.test( values[ 0 ] ) ) {
		throw new Error( 'Invalid agent handoff ID' );
	}
	return values[ 0 ];
}

export async function getAgentSiteStatus( id: string ): Promise< AgentHandoffStatus > {
	const result = ( await wpcom.req.get( {
		path: `/ai/site-build-handoffs/${ id }`,
		apiNamespace: 'wpcom/v2',
	} ) ) as AgentHandoffStatus;
	if ( result.handoff_id !== id ) {
		throw new Error( 'Site handoff could not be confirmed' );
	}
	return result;
}

export async function beginAgentSiteCreation(
	id: string
): Promise< { can_create: boolean; site_id: number | null } > {
	return wpcom.req.post(
		{ path: `/ai/site-build-handoffs/${ id }/begin-creation`, apiNamespace: 'wpcom/v2' },
		{}
	);
}

export async function bindAgentSite( id: string, siteId: number ): Promise< AgentHandoffStatus > {
	const result = ( await wpcom.req.post(
		{ path: `/ai/site-build-handoffs/${ id }/bind-site`, apiNamespace: 'wpcom/v2' },
		{ site_id: siteId }
	) ) as AgentHandoffStatus;
	if ( result.handoff_id !== id || result.site_id !== siteId ) {
		throw new Error( 'Site handoff could not be confirmed' );
	}
	return result;
}

export async function completeAgentCheckout(
	id: string,
	receiptId?: number
): Promise< AgentHandoffStatus > {
	const result = ( await wpcom.req.post(
		{ path: `/ai/site-build-handoffs/${ id }/complete-checkout`, apiNamespace: 'wpcom/v2' },
		receiptId ? { receipt_id: receiptId } : {}
	) ) as AgentHandoffStatus;
	if ( result.handoff_id !== id ) {
		throw new Error( 'Checkout handoff could not be confirmed' );
	}
	return result;
}
