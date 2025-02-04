export const SCOPE_ALL = 'all';
export const SCOPE_SAME = 'same';
export const SCOPE_OTHER = 'other';

export function key( siteId, postId, scope = SCOPE_ALL, size = 2 ) {
	return `${ siteId }-${ postId }-${ scope }-${ size }`;
}
