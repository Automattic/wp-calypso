import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';

const ALLOWED_TAGS = [
	'a',
	'b',
	'bdo',
	'br',
	'code',
	'del',
	'em',
	'i',
	'ins',
	'kbd',
	'mark',
	's',
	'span',
	'strong',
	'sub',
	'sup',
	'u',
];

const ALLOWED_STYLE_PROPERTIES = new Map( [
	[ 'mark', new Set( [ 'background-color', 'color' ] ) ],
	[ 'span', new Set( [ 'text-decoration', 'text-decoration-line' ] ) ],
] );
const ALLOWED_TEXT_COLOR_CLASS = /^has-[a-z0-9-]+-color$/;
const ALLOWED_DIRECTIONS = new Set( [ 'auto', 'ltr', 'rtl' ] );

const SANITIZE_CONFIG: Config = {
	ALLOWED_TAGS,
	ALLOWED_ATTR: [ 'class', 'dir', 'lang', 'style' ],
	ALLOW_ARIA_ATTR: false,
	ALLOW_DATA_ATTR: false,
};

function restrictFormatAttributes( node: Element ) {
	const tagName = node.tagName.toLowerCase();

	if ( node.hasAttribute( 'class' ) ) {
		const allowedClasses =
			tagName === 'mark'
				? node.className
						.split( /\s+/ )
						.filter( ( className ) => ALLOWED_TEXT_COLOR_CLASS.test( className ) )
				: [];
		if ( allowedClasses.length ) {
			node.setAttribute( 'class', allowedClasses.join( ' ' ) );
		} else {
			node.removeAttribute( 'class' );
		}
	}

	if ( node.hasAttribute( 'style' ) ) {
		const allowedProperties = ALLOWED_STYLE_PROPERTIES.get( tagName );
		if ( ! allowedProperties ) {
			node.removeAttribute( 'style' );
		} else {
			const style = ( node as HTMLElement ).style;
			for ( const property of Array.from( style ) ) {
				if ( ! allowedProperties.has( property ) ) {
					style.removeProperty( property );
				}
			}
			if ( ! style.length ) {
				node.removeAttribute( 'style' );
			}
		}
	}

	if ( tagName !== 'bdo' ) {
		node.removeAttribute( 'dir' );
		node.removeAttribute( 'lang' );
	} else if (
		node.hasAttribute( 'dir' ) &&
		! ALLOWED_DIRECTIONS.has( node.getAttribute( 'dir' ) ?? '' )
	) {
		node.removeAttribute( 'dir' );
	}
}

// Use a dedicated instance so this preview policy cannot affect other
// DOMPurify consumers in the same bundle.
const reviewRichTextSanitizer = DOMPurify();
reviewRichTextSanitizer.addHook( 'afterSanitizeAttributes', restrictFormatAttributes );

/**
 * Sanitize block-derived rich text for display in the review UI.
 *
 * This is intentionally a preview policy, not a complete Gutenberg renderer:
 * unsupported elements are unwrapped to readable text, while the core inline
 * text formats used by review suggestions are retained.
 * @param html Raw block-derived rich-text HTML.
 * @returns Sanitized inline HTML.
 */
export function sanitizeReviewRichText( html: string ): string {
	return reviewRichTextSanitizer.sanitize( html, SANITIZE_CONFIG );
}
