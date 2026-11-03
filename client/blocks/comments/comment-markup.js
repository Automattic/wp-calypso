export const isBlockMarkup = ( content ) => content.includes( '<!-- wp:' );

// An inert document, so nothing in the markup runs or loads.
const parse = ( markup ) => new DOMParser().parseFromString( markup, 'text/html' ).body;

// The words of the editor's block markup, for the textarea it falls back to.
export const blocksToText = ( markup ) =>
	parse(
		markup
			.replace( /<\/(p|pre|blockquote|figcaption|ul|ol)>/gi, '$&\n\n' )
			.replace( /<\/li>/gi, '$&\n' )
	)
		.textContent.replace( /\n{3,}/g, '\n\n' )
		.trim();

// Whether the editor's markup holds anything to post. The editor reports an empty paragraph as
// empty, but not an emptied list, quote, or code block.
export const hasBlockContent = ( markup ) => {
	const body = parse( markup );
	return !! body.textContent.trim() || !! body.querySelector( 'img' );
};

const escape = ( text ) =>
	text
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' );

// The inline tags a site's comment kses keeps, so a site without block comments stores them as written.
const INLINE_TAGS = [ 'a', 'b', 'code', 'del', 'em', 'i', 's', 'strong' ];

const inline = ( node ) =>
	Array.from( node.childNodes )
		.map( ( child ) => {
			if ( child.nodeType === child.TEXT_NODE ) {
				return escape( child.textContent );
			}
			if ( child.nodeType !== child.ELEMENT_NODE ) {
				return '';
			}

			const tag = child.tagName.toLowerCase();
			if ( tag === 'br' ) {
				return '\n';
			}
			// A nested list is written out as lines of its own.
			if ( tag === 'ul' || tag === 'ol' ) {
				return '';
			}
			if ( ! INLINE_TAGS.includes( tag ) ) {
				return inline( child );
			}
			if ( tag === 'a' ) {
				const href = child.getAttribute( 'href' ) ?? '';
				return /^(https?:|mailto:)/i.test( href )
					? `<a href="${ escape( href ) }">${ inline( child ) }</a>`
					: inline( child );
			}
			return `<${ tag }>${ inline( child ) }</${ tag }>`;
		} )
		.join( '' );

const list = ( node, depth = 0 ) =>
	Array.from( node.children )
		.filter( ( item ) => item.tagName === 'LI' )
		.flatMap( ( item, index ) => {
			const marker = node.tagName === 'OL' ? `${ index + 1 }.` : '-';
			const nested = Array.from( item.children ).filter(
				( child ) => child.tagName === 'UL' || child.tagName === 'OL'
			);
			return [
				`${ '  '.repeat( depth ) }${ marker } ${ inline( item ).trim() }`,
				...nested.flatMap( ( child ) => list( child, depth + 1 ) ),
			];
		} );

function block( node ) {
	switch ( node.tagName ) {
		case 'UL':
		case 'OL':
			return list( node ).join( '\n' );
		case 'BLOCKQUOTE':
			return `<blockquote>${ blocks( node ) }</blockquote>`;
		case 'PRE':
			return `<code>${ escape( node.textContent ) }</code>`;
		default:
			return inline( node ).trim();
	}
}

function blocks( parent ) {
	return Array.from( parent.children ).map( block ).filter( Boolean ).join( '\n\n' );
}

/**
 * The editor's block markup as HTML a site without block comments keeps: the inline tags core's
 * comment kses allows, with blank lines between paragraphs and lists as lines, which wpautop turns
 * back into paragraphs and line breaks when the comment is shown.
 */
export const blocksToHtml = ( markup ) => blocks( parse( markup ) );
