const DEFAULT_DISCOVER_TAGS = [ 'dailyprompt', 'wordpress' ];
export const DEFAULT_TAB = 'recommended';
export const LATEST_TAB = 'latest';
export const FIRST_POSTS_TAB = 'firstposts';
export const ADD_NEW_TAB = 'add-new';
export const REDDIT_TAB = 'reddit';

/**
 * Filters tags data and returns the tags intended to be loaded by the discover pages recommended
 * section. If tags is null, we return an empty array as we have yet to recieve the users followed
 * tags list. If the users followed tags list is empty, we return a default array of tags used to
 * load the feed. Otherwise, load the feed based on the users follwed tags.
 * @param {Array | null} tags Array of tag slugs to evaluate
 * @returns {Array} Array of tag slugs that will be used for the discover stream.
 */
export function getDiscoverStreamTags( tags, isLoggedIn ) {
	// If tags === [], we load default discover tags. If tags is falsy, we need to wait for the data
	// before determining whether or not to load defaults or use the followed tags array.
	if ( ! tags && isLoggedIn ) {
		return [];
	} else if ( tags?.length === 0 || ! isLoggedIn ) {
		return DEFAULT_DISCOVER_TAGS;
	}
	return tags;
}

export function getSelectedTabTitle( selectedTab ) {
	if ( selectedTab === DEFAULT_TAB ) {
		return 'popular';
	}
	if ( selectedTab === LATEST_TAB ) {
		return 'new';
	}
	if ( selectedTab === FIRST_POSTS_TAB ) {
		return 'fresh';
	}
	return decodeURIComponent( selectedTab );
}

/**
 * Builds a stream key for the discover feed based on the selectedTab and tags for recommended feed.
 * @param {string} selectedTab The discover feed tab that is selected
 * @param {Array} tags The list of tags to use for the recommended feed.
 * @returns {string} The stream key
 */
export function buildDiscoverStreamKey( selectedTab, tags ) {
	let streamKey = `discover:${ selectedTab }`;
	// We want a different stream key for recommended depending on the followed tags that are available.
	if ( selectedTab === DEFAULT_TAB || selectedTab === LATEST_TAB ) {
		// Ensures a different key depending on the users stream tags list. So the stream can update
		// when the user follows/unfollows other tags. Sort the list first so the key is the same
		// per same tags followed. This is necessary since we load a default tag list when none are
		// followed.
		tags.sort();
		streamKey += tags.reduce( ( acc, val ) => acc + `--${ val }`, '' );
	}
	return streamKey;
}

/**
 * Retrieves an array of tags from the discover stream key.
 * @param {string} streamKey The streamKey denoting the tags for the feed.
 * @returns {Array} An array of tag slugs.
 */
export function getTagsFromStreamKey( streamKey = '' ) {
	if (
		streamKey.includes( `discover:${ DEFAULT_TAB }` ) ||
		streamKey.includes( `discover:${ LATEST_TAB }` )
	) {
		const tags = streamKey.split( '--' );
		tags.shift();
		return tags;
	}
	return [];
}
