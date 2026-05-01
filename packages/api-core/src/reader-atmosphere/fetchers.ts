import { wpcom } from '../wpcom-fetcher';
import { classifyAtmosphereError } from './errors';
import type {
	AtmosphereAuthorFeedFilter,
	AtmosphereAuthorFeedPage,
	AtmosphereAuthorProfile,
	AtmosphereConnectionDetails,
	AtmosphereConnectionsResponse,
	AtmosphereCreateConnectionResponse,
	AtmosphereThreadResponse,
	AtmosphereTimelinePage,
} from './types';

const NAMESPACE = 'wpcom/v2';

export async function getConnections(): Promise< AtmosphereConnectionsResponse > {
	try {
		return ( await wpcom.req.get( {
			path: '/reader/atmosphere/connections',
			apiNamespace: NAMESPACE,
		} ) ) as AtmosphereConnectionsResponse;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export interface CreateConnectionParams {
	handle: string;
	app_password: string;
}

export async function createConnection(
	params: CreateConnectionParams
): Promise< AtmosphereCreateConnectionResponse > {
	try {
		return ( await wpcom.req.post( {
			path: '/reader/atmosphere/connections',
			apiNamespace: NAMESPACE,
			body: params,
		} ) ) as AtmosphereCreateConnectionResponse;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export async function getConnection( id: number ): Promise< AtmosphereConnectionDetails > {
	try {
		return ( await wpcom.req.get( {
			path: `/reader/atmosphere/connections/${ id }`,
			apiNamespace: NAMESPACE,
		} ) ) as AtmosphereConnectionDetails;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export interface GetTimelineParams {
	connectionId: number;
	cursor?: string;
	limit?: number;
}

export async function getTimeline( params: GetTimelineParams ): Promise< AtmosphereTimelinePage > {
	const { connectionId, cursor, limit } = params;
	const query: Record< string, string > = {};
	if ( cursor ) {
		query.cursor = cursor;
	}
	if ( limit ) {
		query.limit = String( limit );
	}
	try {
		return ( await wpcom.req.get(
			{
				path: `/reader/atmosphere/connections/${ connectionId }/timeline`,
				apiNamespace: NAMESPACE,
			},
			query
		) ) as AtmosphereTimelinePage;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export interface GetThreadParams {
	uri: string;
	depth?: number;
	parentHeight?: number;
}

export async function getThread( params: GetThreadParams ): Promise< AtmosphereThreadResponse > {
	const { uri, depth, parentHeight } = params;
	const query: Record< string, string > = { uri };
	// typeof guard preserves depth=0 (root only) and parentHeight=0 — valid backend values.
	if ( typeof depth === 'number' ) {
		query.depth = String( depth );
	}
	if ( typeof parentHeight === 'number' ) {
		query.parentHeight = String( parentHeight );
	}
	try {
		return ( await wpcom.req.get(
			{
				path: '/reader/atmosphere/thread',
				apiNamespace: NAMESPACE,
			},
			query
		) ) as AtmosphereThreadResponse;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export interface GetAuthorProfileParams {
	actor: string;
}

export async function getAuthorProfile(
	params: GetAuthorProfileParams
): Promise< AtmosphereAuthorProfile > {
	const { actor } = params;
	try {
		return ( await wpcom.req.get( {
			path: `/reader/atmosphere/profile/${ encodeURIComponent( actor ) }`,
			apiNamespace: NAMESPACE,
		} ) ) as AtmosphereAuthorProfile;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}

export interface GetAuthorFeedParams {
	actor: string;
	cursor?: string;
	limit?: number;
	filter?: AtmosphereAuthorFeedFilter;
}

export async function getAuthorFeed(
	params: GetAuthorFeedParams
): Promise< AtmosphereAuthorFeedPage > {
	const { actor, cursor, limit, filter } = params;
	const query: Record< string, string > = {};
	if ( cursor ) {
		query.cursor = cursor;
	}
	if ( limit ) {
		query.limit = String( limit );
	}
	if ( filter ) {
		query.filter = filter;
	}
	try {
		return ( await wpcom.req.get(
			{
				path: `/reader/atmosphere/profile/${ encodeURIComponent( actor ) }/feed`,
				apiNamespace: NAMESPACE,
			},
			query
		) ) as AtmosphereAuthorFeedPage;
	} catch ( raw ) {
		throw classifyAtmosphereError( raw );
	}
}
