const API_URL = 'https://public-api.wordpress.com/rest/v1.2/freshly-pressed?number=20';
const CACHE_KEY = 'reader_freshly_pressed';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCache() {
	try {
		const raw = localStorage.getItem( CACHE_KEY );
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

function setCache( posts ) {
	try {
		localStorage.setItem( CACHE_KEY, JSON.stringify( { posts, timestamp: Date.now() } ) );
	} catch {
		// localStorage full or unavailable — ignore
	}
}

export async function fetchFreshlyPressed() {
	const response = await fetch( API_URL );
	if ( ! response.ok ) {
		throw new Error( `API error: ${ response.status }` );
	}
	const data = await response.json();
	const posts = data.posts || [];
	setCache( posts );
	return posts;
}

export function getCachedPosts() {
	return getCache();
}
