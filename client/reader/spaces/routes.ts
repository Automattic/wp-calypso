export const SPACES_BASE_PATH = '/reader/spaces';

export function getSpacePath( id: string ): string {
	// Encode the segment to match the other Reader route builders; ids are
	// opaque, so never assume they are already URL-safe.
	return `${ SPACES_BASE_PATH }/${ encodeURIComponent( id ) }`;
}
