/**
 * Returns an ID for transient media items. To be consistent in creating
 * transient media IDs they are all prefixed with 'media-'
 * @param {string} moreSpecificPrefix can be used to further specify the prefix
 */
export function createTransientMediaId( moreSpecificPrefix = '' ) {
	return `media-${ moreSpecificPrefix }${ crypto.randomUUID() }`;
}
