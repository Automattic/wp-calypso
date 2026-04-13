const FRESHLY_PRESSED_URL = 'https://public-api.wordpress.com/rest/v1.2/freshly-pressed?number=20';
const FOLLOWING_URL = 'https://public-api.wordpress.com/rest/v1.2/read/following?number=20';
const CACHE_KEY_PUBLIC = 'reader_freshly_pressed';
const CACHE_KEY_FOLLOWING = 'reader_following';
const CACHE_TTL_MS = 30 * 60 * 1000;

function getCache( key ) {
	try {
		const raw = localStorage.getItem( key );
		if ( ! raw ) {
			return null;
		}
		const cached = JSON.parse( raw );
		if ( Date.now() - cached.timestamp > CACHE_TTL_MS ) {
			return null;
		}
		return cached.posts;
	} catch {
		return null;
	}
}

function setCache( key, posts ) {
	try {
		localStorage.setItem( key, JSON.stringify( { posts, timestamp: Date.now() } ) );
	} catch {
		// localStorage full or unavailable
	}
}

export async function fetchFreshlyPressed() {
	const response = await fetch( FRESHLY_PRESSED_URL );
	if ( ! response.ok ) {
		throw new Error( `API error: ${ response.status }` );
	}
	const data = await response.json();
	const posts = data.posts || [];
	setCache( CACHE_KEY_PUBLIC, posts );
	return posts;
}

export async function fetchFollowing( token ) {
	const response = await fetch( FOLLOWING_URL, {
		headers: { Authorization: `Bearer ${ token }` },
	} );
	if ( response.status === 401 || response.status === 403 ) {
		throw new Error( 'auth_expired' );
	}
	if ( ! response.ok ) {
		throw new Error( `API error: ${ response.status }` );
	}
	const data = await response.json();
	const posts = data.posts || [];
	setCache( CACHE_KEY_FOLLOWING, posts );
	return posts;
}

export function getCachedPosts( authenticated ) {
	return getCache( authenticated ? CACHE_KEY_FOLLOWING : CACHE_KEY_PUBLIC );
}
