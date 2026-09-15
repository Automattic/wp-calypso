import debugFactory from 'debug';

const debug = debugFactory( 'calypso:components:embed-container' );

/**
 * EmbedContainer hands live post content to third-party embed runtimes. Those runtimes read their
 * configuration back out of the DOM with `getAttribute()`, which returns the entity-decoded value,
 * and feed it to sinks we do not control: some assign it to the `src` of a frame they insert into
 * our document, others interpolate it into an HTML string that the browser parses a second time.
 *
 * Post content is author controlled, so a value that is inert everywhere we inspect it -- in the
 * database, in the API response, in our own DOM -- can still turn into markup, or into a
 * `javascript:` navigation, inside a provider's own code. The rules below make the values safe for
 * both sinks before any provider script gets to see them.
 */

// Characters that let a value escape its attribute, or open an element, on that second parse.
const MARKUP_CHARACTERS = /["'<>]/;

// Data attributes that legitimately carry a quoted payload and whose consumers we know reach
// text-only sinks: the carousel metadata the post normalizer reads, and the caption/title markup
// the gallery components strip before rendering.
const ATTRIBUTES_ALLOWED_TO_CARRY_MARKUP = [
	'data-carousel-extra',
	'data-image-caption',
	'data-image-description',
	'data-image-meta',
	'data-image-title',
];

const INSTAGRAM_PERMALINK_HOSTS = [ 'instagram.com', 'instagr.am', 'cdninstagram.com' ];

function parseUrl( value ) {
	try {
		return new URL( value, window.location.href );
	} catch {
		return null;
	}
}

function isWebUrl( value ) {
	const url = parseUrl( value );
	return !! url && ( url.protocol === 'http:' || url.protocol === 'https:' );
}

function isInstagramPermalink( value ) {
	const url = parseUrl( value );
	return (
		!! url &&
		url.protocol === 'https:' &&
		INSTAGRAM_PERMALINK_HOSTS.some(
			( host ) => url.hostname === host || url.hostname.endsWith( `.${ host }` )
		)
	);
}

// Attributes a provider turns into the URL of a frame it inserts into our document. The Instagram
// permalink is held to its own hosts as well, so the runtime cannot be pointed at an arbitrary
// origin either.
const URL_ATTRIBUTES = {
	cite: isWebUrl,
	'data-embed-url': isWebUrl,
	'data-href': isWebUrl,
	'data-instgrm-permalink': isInstagramPermalink,
	'data-url': isWebUrl,
};

/**
 * Reduce a value to the plain text it is meant to be, re-encoded so that it stays text however the
 * consuming script inserts it.
 *
 * Decoding happens in a DOMParser document, which has no browsing context, so markup in the value
 * cannot load resources or run handlers on the way through.
 * @param {*} value - A value that reaches a sink expecting text.
 * @returns {string} The value, as encoded text.
 */
function toInertText( value ) {
	const decoded = new DOMParser().parseFromString( String( value ?? '' ), 'text/html' );
	const encoder = document.createElement( 'div' );

	encoder.textContent = decoded.body.textContent ?? '';

	return encoder.innerHTML;
}

/**
 * @param {unknown} slide - One entry of a `data-gallery` payload.
 * @returns {Object} The slide reduced to primitive fields, with its caption flattened to text.
 */
function sanitizeSlide( slide ) {
	if ( ! slide || typeof slide !== 'object' ) {
		return {};
	}

	return Object.fromEntries(
		Object.entries( slide )
			.filter( ( [ , field ] ) => typeof field !== 'object' )
			.map( ( [ name, field ] ) => [ name, name === 'caption' ? toInertText( field ) : field ] )
	);
}

/**
 * Make a Jetpack slideshow payload safe to render.
 *
 * A slideshow is described by a JSON array, so `data-gallery` has to keep its quotes to stay
 * parseable and cannot go through the blanket check above. The shortcode script assigns each
 * slide's caption to innerHTML, so captions are the part of the payload that is parsed as markup.
 *
 * Nested values are dropped along the way. innerHTML takes a string, so an array of markup would
 * be coerced straight back into the markup it holds.
 * @param {string} value - The raw `data-gallery` value.
 * @returns {string|null} An equivalent payload with inert captions, or null if it is not a gallery.
 */
function sanitizeGallery( value ) {
	let gallery;

	try {
		gallery = JSON.parse( value );
	} catch {
		return null;
	}

	return Array.isArray( gallery ) ? JSON.stringify( gallery.map( sanitizeSlide ) ) : null;
}

function sanitizeGalleryAttribute( node ) {
	if ( ! node.hasAttribute( 'data-gallery' ) ) {
		return;
	}

	const sanitized = sanitizeGallery( node.getAttribute( 'data-gallery' ) );

	if ( sanitized === null ) {
		debug( 'removing unparseable data-gallery from', node );
		node.removeAttribute( 'data-gallery' );
	} else {
		node.setAttribute( 'data-gallery', sanitized );
	}
}

function sanitizeAttribute( node, name, value ) {
	const isAllowedUrl = URL_ATTRIBUTES[ name ];

	// Anything else outside the `data-` namespace is markup we render ourselves, not configuration
	// a provider reads back.
	if ( ! isAllowedUrl && ! name.startsWith( 'data-' ) ) {
		return;
	}

	if ( ATTRIBUTES_ALLOWED_TO_CARRY_MARKUP.includes( name ) ) {
		return;
	}

	// A well-formed URL has these percent-encoded, so the check applies to URL attributes too: a
	// value can be a perfectly valid https URL and still carry the quote that ends the attribute a
	// provider is building around it.
	if ( MARKUP_CHARACTERS.test( value ) || ( isAllowedUrl && ! isAllowedUrl( value ) ) ) {
		debug( 'removing unsafe %s from', name, node );
		node.removeAttribute( name );
	}
}

function sanitizeNode( node ) {
	sanitizeGalleryAttribute( node );

	Array.from( node.attributes ).forEach( ( { name, value } ) => {
		if ( name !== 'data-gallery' ) {
			sanitizeAttribute( node, name, value );
		}
	} );
}

function subtree( root ) {
	return [ root, ...root.querySelectorAll( '*' ) ];
}

/**
 * Make every embed's data safe to read back out of the DOM.
 *
 * This sweeps the whole subtree rather than the nodes our own selectors matched, because the
 * runtimes we load scan the document for their own markers: a blockquote we skip because its class
 * list does not *start* with `instagram-` is still picked up by Instagram's `.instagram-media`
 * scan once a sibling embed has pulled the script in.
 * @param {Element} root - A subtree of post content.
 */
export function sanitizeEmbedData( root ) {
	subtree( root ).forEach( sanitizeNode );
}

/**
 * Sanitize the gallery data of every slideshow in a document.
 *
 * JetpackSlideshow initializes every slideshow it can find rather than the one that asked for it,
 * so this matches the scope it runs over.
 * @param {Document} doc - The document the slideshow script is about to initialize over.
 */
export function sanitizeSlideshowGalleries( doc ) {
	doc.querySelectorAll( '.jetpack-slideshow' ).forEach( sanitizeGalleryAttribute );
}
