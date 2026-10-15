import { store as coreStore } from '@wordpress/core-data';
import { resolveSelect } from '@wordpress/data';

interface CoreResolve {
	getEditedEntityRecord: (
		kind: string,
		name: string,
		id: number | string
	) => Promise< Record< string, unknown > | false | undefined >;
}

const isNotFound = ( error: unknown ): boolean => {
	const { code, data } = ( error ?? {} ) as { code?: string; data?: { status?: number } };

	return data?.status === 404 || code === 'rest_post_invalid_id';
};

/**
 * The edited record, or `null` when it no longer exists. The store rejects a
 * missing record rather than returning nothing; any other failure still throws.
 */
export async function readRecord(
	kind: string,
	name: string,
	id: number | string
): Promise< Record< string, unknown > | null > {
	try {
		const resolve = resolveSelect( coreStore ) as unknown as CoreResolve;

		return ( await resolve.getEditedEntityRecord( kind, name, id ) ) || null;
	} catch ( error ) {
		if ( isNotFound( error ) ) {
			return null;
		}

		throw error;
	}
}
