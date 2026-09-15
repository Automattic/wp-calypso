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

// Characters that let a value escape its quoted attribute, or open an element, on that second
// parse. Only the data- namespace is swept for these: attributes like title and alt legitimately
// carry quotes in post content, so stripping them would cost more than it buys.
const MARKUP_CHARACTERS = /["'<>]/;

// Never a legitimate embed value, and a runtime that puts one in an href would run it on click.
const UNSAFE_URI_SCHEME = /^\s*(?:javascript|vbscript):/i;

// Quoted payloads we consume ourselves, and only ever as text or as a URL assigned to a property,
// never by interpolating them into markup: the carousel metadata the post normalizer reads, and
// the caption and original-file URL the image carousel reads.
const DATA_ATTRIBUTES_WE_CONSUME = [
	'data-carousel-extra',
	'data-image-caption',
	'data-orig-file',
];

const INSTAGRAM_PERMALINK_HOSTS = [ 'instagram.com', 'instagr.am' ];

// Reserved TLD, so it can never collide with a host an embed legitimately points at.
const RELATIVE_URL_HOST = 'embed-container.invalid';

/**
 * Parse a value a provider would navigate to.
 *
 * The placeholder base lets protocol-relative values parse while still rejecting path-relative
 * ones, which land back on the placeholder host and are never something a provider would frame.
 * Resolving against a fixed base rather than `window.location` also keeps the result independent
 * of the document URL, which matters because this component ships in the Help Center bundle on
 * widgets.wp.com as well.
 * @param {string} value - An attribute value.
 * @returns {URL|null} The parsed URL, or null when it is not an absolute one.
 */
function parseUrl( value ) {
	try {
		const url = new URL( value, `https://${ RELATIVE_URL_HOST }` );
		return url.hostname === RELATIVE_URL_HOST ? null : url;
	} catch {
		return null;
	}
}

function isHttpProtocol( url ) {
	return url.protocol === 'http:' || url.protocol === 'https:';
}

function isHttpUrl( value ) {
	const url = parseUrl( value );
	return !! url && isHttpProtocol( url );
}

function isInstagramPermalink( value ) {
	const url = parseUrl( value );
	return (
		!! url &&
		isHttpProtocol( url ) &&
		INSTAGRAM_PERMALINK_HOSTS.some(
			( host ) => url.hostname === host || url.hostname.endsWith( `.${ host }` )
		)
	);
}

// Attributes a provider navigates to, either as the `src` of a frame it inserts into our document
// or as a `window.open` target from a document-level click handler. The Instagram permalink is
// held to its own hosts as well, so the runtime cannot be pointed at an arbitrary origin either.
const URL_ATTRIBUTES = {
	cite: isHttpUrl,
	'data-embed-url': isHttpUrl,
	'data-href': isHttpUrl,
	'data-instgrm-permalink': isInstagramPermalink,
	'data-pin-href': isHttpUrl,
	'data-url': isHttpUrl,
};

/**
 * Reduce a value to the plain text it is meant to be, re-encoded so that it stays text however the
 * consuming script inserts it.
 *
 * Decoding happens in a DOMParser document, which has no browsing context, so markup in the value
 * cannot load resources or run handlers on the way through. Decoding before re-encoding is also
 * what keeps this idempotent: the pass runs again every time a slideshow initializes, and an
 * encoder that skipped the decode would turn `&amp;` into `&amp;amp;` a little more on each run.
 *
 * Letting the HTML parser decide what a tag is keeps text the author meant to show: a caption
 * reading `Temperatures < 0` has no element in it, because `<` followed by a space cannot open one.
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
 * The shortcode script assigns each caption to innerHTML, which coerces a non-string: an array of
 * markup joins straight back into markup, so nested fields are dropped rather than flattened.
 * @param {unknown} slide - One entry of a `data-gallery` payload.
 * @returns {Object} The slide reduced to primitive fields, with its caption flattened to text.
 */
function sanitizeSlide( slide ) {
	if ( ! slide || typeof slide !== 'object' ) {
		return {};
	}

	const sanitized = Object.fromEntries(
		Object.entries( slide ).filter( ( [ , field ] ) => typeof field !== 'object' )
	);

	// The script assigns this one unguarded, so a missing or dropped key renders as "undefined".
	const { caption } = slide;
	sanitized.caption = caption === null || typeof caption === 'object' ? '' : toInertText( caption );

	return sanitized;
}

/**
 * Reduce the captions in a slideshow container's gallery data to text.
 *
 * `data-gallery` only holds a JSON payload on a Jetpack slideshow; elsewhere it is a grouping key,
 * which is the convention lightbox libraries use, so the class the slideshow runtime scans for
 * gates this. The attribute keeps its quotes, since it has to stay parseable.
 *
 * Gallery data we cannot rewrite is discarded rather than left as it was, and every failure is
 * handled here so that one bad container cannot stop the rest of the page being sanitized.
 * @param {Element} node - A node that may be a slideshow container.
 */
function sanitizeGalleryAttribute( node ) {
	if ( ! node.hasAttribute( 'data-gallery' ) || ! node.matches( '.jetpack-slideshow' ) ) {
		return;
	}

	const value = node.getAttribute( 'data-gallery' );

	try {
		const gallery = JSON.parse( value );

		if ( ! Array.isArray( gallery ) ) {
			throw new Error( 'gallery data is not a list of slides' );
		}

		// JSON.parse() accepts nesting deep enough to overflow the stack in JSON.stringify().
		const sanitized = JSON.stringify( gallery.map( sanitizeSlide ) );

		if ( sanitized !== value ) {
			node.setAttribute( 'data-gallery', sanitized );
		}
	} catch ( error ) {
		debug( 'discarding unusable slideshow gallery data', error );
		node.removeAttribute( 'data-gallery' );
		// Left to JetpackSlideshow, an empty gallery becomes a spinner it never clears.
		node.dataset.processed = 'true';
	}
}

function sanitizeAttribute( node, name, value ) {
	const isAllowedUrl = URL_ATTRIBUTES[ name ];

	// Anything else outside the `data-` namespace is markup we render ourselves, not configuration
	// a provider reads back.
	if ( ! isAllowedUrl && ! name.startsWith( 'data-' ) ) {
		return;
	}

	if ( UNSAFE_URI_SCHEME.test( value ) ) {
		debug( 'removing script-scheme attribute %s from', name, node );
		node.removeAttribute( name );
		return;
	}

	if ( DATA_ATTRIBUTES_WE_CONSUME.includes( name ) ) {
		return;
	}

	// A well-formed URL has these percent-encoded, so the markup check applies to URL attributes
	// too: a value can be a perfectly good https URL and still carry the quote that ends the
	// attribute a provider is building around it.
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
