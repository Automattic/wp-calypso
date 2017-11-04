/** @format */
/**
 * External dependencies
 */
import validUrl from 'valid-url';

const isAllowedTag = tagName => {
	switch ( tagName ) {
		case '#text':
		case 'a':
		case 'b':
		case 'blockquote':
		case 'code':
		case 'div':
		case 'em':
		case 'h1':
		case 'h2':
		case 'h3':
		case 'h4':
		case 'h5':
		case 'h6':
		case 'i':
		case 'img':
		case 'li':
		case 'ol':
		case 'p':
		case 'span':
		case 'strong':
		case 'ul':
			return true;
		default:
			return false;
	}
};

const isAllowedAttr = ( tagName, attrName ) => {
	if ( 'a' === tagName && 'href' === attrName ) {
		return true;
	}

	if ( 'iframe' === tagName ) {
		switch ( attrName ) {
			case 'class':
			case 'type':
			case 'height':
			case 'width':
			case 'src':
				return true;
			default:
				return false;
		}
	}

	if ( 'img' === tagName && ( 'alt' === attrName || 'src' === attrName ) ) {
		return true;
	}

	return false;
};

const isValidYoutubeEmbed = node => {
	if ( node.nodeName.toLowerCase() !== 'iframe' ) {
		return false;
	}

	if ( node.getAttribute( 'class' ) !== 'youtube-player' ) {
		return false;
	}

	if ( node.getAttribute( 'type' ) !== 'text/html' ) {
		return false;
	}

	const link = document.createElement( 'a' );
	link.href = node.getAttribute( 'src' );

	return (
		validUrl.isWebUri( node.getAttribute( 'src' ) ) &&
		( link.hostname === 'youtube.com' || link.hostname === 'www.youtube.com' )
	);
};

/**
 * Sanitizes input HTML for security and styling
 *
 * @param {String} content unverified HTML
 * @returns {string} sanitized HTML
 */
export const sanitizeSectionContent = content => {
	const parser = new DOMParser();
	const doc = parser.parseFromString( content, 'text/html' );

	// this will let us visit every single DOM node programmatically
	const walker = doc.createTreeWalker(
		doc.body,
		NodeFilter.SHOW_ALL,
		{ acceptNode: () => NodeFilter.FILTER_ACCEPT },
		false
	);

	// we don't want to remove nodes while walking the tree
	// or we'll invite data-race bugs. instead, we'll track
	// which ones we want to remove then drop them at the end
	const removeList = [];

	// walk over every DOM node
	while ( walker.nextNode() ) {
		const node = walker.currentNode;
		const tagName = node.nodeName.toLowerCase();

		if ( ! isAllowedTag( tagName ) && ! isValidYoutubeEmbed( node ) ) {
			removeList.push( node );
			continue;
		}

		// strip out anything not explicitly allowed
		// in the attributes. we want to eliminate
		// potential cross-site scripting attacks _and_
		// prevent custom styles from interfering with
		// our page's own rendering

		const attrRemoveList = [];

		// these aren't Arrays, so iteration is odd
		for ( let i = 0; node.attributes && i < node.attributes.length; i++ ) {
			const { name: attrName, value } = node.attributes[ i ];

			// get rid of non-whitelisted attributes
			if ( ! isAllowedAttr( tagName, attrName ) ) {
				attrRemoveList.push( attrName );
				continue;
			}

			// for some, specifically links, we don't want to
			// "sanitize" the values because we could mess them up
			// for example, encoding a real URL will break it
			if (
				( ( 'src' === attrName || 'href' === attrName ) && validUrl.isWebUri( value ) ) ||
				( 'iframe' === tagName && 'type' === attrName && isValidYoutubeEmbed( node ) )
			) {
				continue;
			}

			// just don't even allow non-url links
			if ( ( 'href' === attrName || 'src' === attrName ) && ! validUrl.isWebUri( value ) ) {
				attrRemoveList.push( attrName );
				continue;
			}

			// every other other allowed attribute must be sanitized
			// this is a broad and clumsy stroke but it should be
			// effective, leaning towards safety instead of
			// compatibility with the remote HTML
			node.setAttribute( attrName, encodeURIComponent( value ) );
		}

		// actually remove the attributes
		attrRemoveList.forEach( name => node.removeAttribute( name ) );

		// of course, all links need to be normalized since
		// they now exist inside of the Calypso context
		if ( 'a' === tagName && node.getAttribute( 'href' ) ) {
			node.setAttribute( 'target', '_blank' );
			node.setAttribute( 'rel', 'external noopener noreferrer' );
		}
	}

	// once done walking the DOM tree
	// remove the unwanted tags and transfer
	// their children up a level in their place
	removeList.forEach( node => {
		const parent = node.parentNode;
		let child;

		try {
			// eslint-disable-next-line no-cond-assign
			while ( ( child = node.firstChild ) ) {
				parent.insertBefore( child, node );
			}

			parent.removeChild( node );
		} catch ( e ) {
			// this one could have originally existed
			// under a node that we already removed,
			// which would lead to a failure right now
			// this is fine, just continue along
		}
	} );

	const html = doc.body.innerHTML;

	// finally, bump higher-level headers down a few levels
	// because we're sitting under an <h2> context already
	return html.replace( /<h[12]/, '<h3' ).replace( /<\/h[12]/, '</h3' );
};
