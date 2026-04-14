const FRESHLY_PRESSED_URL = 'https://public-api.wordpress.com/rest/v1.2/freshly-pressed';
const FOLLOWING_URL = 'https://public-api.wordpress.com/rest/v1.2/read/following';
const PAGE_SIZE = 20;
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

export async function fetchFreshlyPressed( before ) {
	let url = `${ FRESHLY_PRESSED_URL }?number=${ PAGE_SIZE }`;
	if ( before ) {
		url += `&before=${ encodeURIComponent( before ) }`;
	}
	const response = await fetch( url );
	if ( ! response.ok ) {
		throw new Error( `API error: ${ response.status }` );
	}
	const data = await response.json();
	const posts = data.posts || [];
	if ( ! before ) {
		setCache( CACHE_KEY_PUBLIC, posts );
	}
	return posts;
}

export async function fetchFollowing( token, before ) {
	let url = `${ FOLLOWING_URL }?number=${ PAGE_SIZE }`;
	if ( before ) {
		url += `&before=${ encodeURIComponent( before ) }`;
	}
	const response = await fetch( url, {
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
	if ( ! before ) {
		setCache( CACHE_KEY_FOLLOWING, posts );
	}
	return posts;
}

export function getCachedPosts( authenticated ) {
	return getCache( authenticated ? CACHE_KEY_FOLLOWING : CACHE_KEY_PUBLIC );
}

export async function fetchMe( token ) {
	const response = await fetch( 'https://public-api.wordpress.com/rest/v1.1/me', {
		headers: { Authorization: `Bearer ${ token }` },
	} );
	if ( ! response.ok ) {
		throw new Error( `API error: ${ response.status }` );
	}
	return response.json();
}
