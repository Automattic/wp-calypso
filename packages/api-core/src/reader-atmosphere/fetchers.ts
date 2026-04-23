import { wpcom } from '../wpcom-fetcher';
import { classifyAtmosphereError } from './errors';
import type {
	AtmosphereConnectionDetails,
	AtmosphereConnectionsResponse,
	AtmosphereCreateConnectionResponse,
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
