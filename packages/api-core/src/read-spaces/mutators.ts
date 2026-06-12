import { DEFAULT_SPACE_LAYOUT } from './constants';
import type {
	CreateReadSpaceParams,
	ReadSpaceDetails,
	ReadSpaceSourceMutationParams,
} from './types';

/**
 * Create a space.
 *
 * TODO(RSM-4139): call the real POST endpoint once it exists. For now the space
 * is constructed locally and the api-query layer writes it to the React Query
 * cache. Returns the detail shape (with an empty source list) so the create
 * flow can seed the single-space cache.
 */
export function createReadSpace( params: CreateReadSpaceParams ): Promise< ReadSpaceDetails > {
	return Promise.resolve( {
		id: generateSpaceId(),
		name: params.name,
		tags: params.tags,
		layout: { ...DEFAULT_SPACE_LAYOUT },
		sources: [],
	} );
}

export function addReadSpaceSource( params: ReadSpaceSourceMutationParams ): Promise< void > {
	void params;
	return Promise.resolve();
}

export function deleteReadSpaceSource( params: ReadSpaceSourceMutationParams ): Promise< void > {
	void params;
	return Promise.resolve();
}

function generateSpaceId(): string {
	// `crypto.randomUUID` is available in all supported browsers; fall back to a
	// random base36 string in non-secure or test contexts where it is undefined.
	if ( typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ) {
		return crypto.randomUUID();
	}
	return Math.random().toString( 36 ).slice( 2, 12 );
}
