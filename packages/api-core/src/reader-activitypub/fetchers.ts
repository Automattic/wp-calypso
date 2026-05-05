import { wpcom } from '../wpcom-fetcher';
import { classifyFediverseError } from './errors';
import type {
	FediverseActorType,
	FediverseAuthorizeResponse,
	FediverseConnection,
	FediverseConnectionsResponse,
	FediverseEnableResponse,
	FediverseNote,
	FediverseSiteCapabilities,
} from './types';

const NAMESPACE = 'wpcom/v2';

export async function getFediverseConnections(): Promise< FediverseConnectionsResponse > {
	try {
		return ( await wpcom.req.get( {
			path: '/reader/activitypub/connections',
			apiNamespace: NAMESPACE,
		} ) ) as FediverseConnectionsResponse;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

export async function getFediverseConnection( id: number ): Promise< FediverseConnection > {
	try {
		return ( await wpcom.req.get( {
			path: `/reader/activitypub/connections/${ id }`,
			apiNamespace: NAMESPACE,
		} ) ) as FediverseConnection;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

export async function deleteFediverseConnection( id: number ): Promise< void > {
	try {
		await wpcom.req.post( {
			path: `/reader/activitypub/connections/${ id }`,
			apiNamespace: NAMESPACE,
			method: 'DELETE',
		} );
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

export interface AuthorizeFediverseConnectionParams {
	blog_id: number;
	actor?: FediverseActorType;
}

export async function authorizeFediverseConnection(
	params: AuthorizeFediverseConnectionParams
): Promise< FediverseAuthorizeResponse > {
	try {
		return ( await wpcom.req.post( {
			path: '/reader/activitypub/connections',
			apiNamespace: NAMESPACE,
			body: { step: 'authorize', ...params },
		} ) ) as FediverseAuthorizeResponse;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

export interface CompleteFediverseConnectionParams {
	code: string;
	state: string;
}

export async function completeFediverseConnection(
	params: CompleteFediverseConnectionParams
): Promise< { connection: FediverseConnection } > {
	try {
		// The upstream returns `{ connection: FediverseConnection }` matching the
		// mastodon complete-connection shape. We cast directly to that wrapper
		// rather than rebundling at the fetcher level.
		return ( await wpcom.req.post( {
			path: '/reader/activitypub/connections',
			apiNamespace: NAMESPACE,
			body: { step: 'complete', ...params },
		} ) ) as { connection: FediverseConnection };
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

export async function getFediverseSiteCapabilities(
	blogId: number
): Promise< FediverseSiteCapabilities > {
	try {
		return ( await wpcom.req.get( {
			path: `/reader/activitypub/sites/${ blogId }/capabilities`,
			apiNamespace: NAMESPACE,
		} ) ) as FediverseSiteCapabilities;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

export async function enableFediverseFeature( blogId: number ): Promise< FediverseEnableResponse > {
	try {
		return ( await wpcom.req.post( {
			path: `/reader/activitypub/sites/${ blogId }/enable-feature`,
			apiNamespace: NAMESPACE,
		} ) ) as FediverseEnableResponse;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

export async function enableFediverseC2s( blogId: number ): Promise< FediverseEnableResponse > {
	try {
		return ( await wpcom.req.post( {
			path: `/reader/activitypub/sites/${ blogId }/enable-c2s`,
			apiNamespace: NAMESPACE,
		} ) ) as FediverseEnableResponse;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

export async function enableFediverseUserActors(
	blogId: number
): Promise< FediverseEnableResponse > {
	try {
		return ( await wpcom.req.post( {
			path: `/reader/activitypub/sites/${ blogId }/enable-user-actors`,
			apiNamespace: NAMESPACE,
		} ) ) as FediverseEnableResponse;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}

export interface CreateFediverseNoteParams {
	connectionId: number;
	text: string;
}

export async function createFediverseNote(
	params: CreateFediverseNoteParams
): Promise< FediverseNote > {
	const { connectionId, text } = params;
	try {
		return ( await wpcom.req.post( {
			path: `/reader/activitypub/connections/${ connectionId }/notes`,
			apiNamespace: NAMESPACE,
			body: { text },
		} ) ) as FediverseNote;
	} catch ( raw ) {
		throw classifyFediverseError( raw );
	}
}
