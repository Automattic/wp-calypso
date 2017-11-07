/** @format */
/**
 * External dependencies
 */
import { forEach } from 'lodash';
import validUrl from 'valid-url';

/**
 * Determine if a given tag is allowed
 *
 * This only looks at the name of the tag to
 * determine if it's white-listed.
 *
 * @param {String} tagName name of tag under inspection
 * @returns {Boolean} whether the tag is allowed
 */
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

/**
 * Determine if a given attribute is allowed
 *
 * Note! Before adding more attributes here
 *       make sure that we don't open up an
 *       attribute which could allow for a
 *       snippet of code to execute, such
 *       as `onclick` or `onmouseover`
 *
 * @param {String} tagName name of tag on which attribute is found
 * @param {String} attrName name of attribute under inspection
 * @returns {Boolean} whether the attribute is allowed
 */
const isAllowedAttr = ( tagName, attrName ) => {
	switch ( tagName ) {
		case 'a':
			return 'href' === attrName;

		case 'iframe':
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

		case 'img':
			switch ( attrName ) {
				case 'alt':
				case 'src':
					return true;
				default:
					return false;
			}

		default:
			return false;
	}
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

const replacementFor = node => {
	const tagName = node.nodeName.toLocaleLowerCase();

	switch ( tagName ) {
		case 'h1':
		case 'h2':
			return 'h3';

		default:
			return null;
	}
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
	const walker = doc.createTreeWalker( doc.body );

	/**
	 * we don't want to remove nodes while walking the tree
	 * or we'll invite data-race bugs. instead, we'll track
	 * which ones we want to remove then drop them at the end
	 *
	 * @type {Array<Node>} List of nodes to remove
	 */
	const removeList = [];

	/**
	 * track any tags we want to replace, we'll need to
	 * transfer the children too when we do the swap
	 *
	 * @type {Array<Node, Node>} List of pairs of nodes and their replacements
	 */
	const replacements = [];

	// walk over every DOM node
	while ( walker.nextNode() ) {
		const node = walker.currentNode;
		const tagName = node.nodeName.toLowerCase();

		if ( ! isAllowedTag( tagName ) && ! isValidYoutubeEmbed( node ) ) {
			removeList.push( node );
			continue;
		}

		const replacement = replacementFor( node );
		if ( replacement ) {
			replacements.push( [ node, document.createElement( replacement ) ] );
		}

		// strip out anything not explicitly allowed
		// in the attributes. we want to eliminate
		// potential cross-site scripting attacks _and_
		// prevent custom styles from interfering with
		// our page's own rendering

		const attrRemoveList = [];

		// these aren't Arrays, so iteration is odd
		forEach( node.attributes, ( { name: attrName, value } ) => {
			// get rid of non-whitelisted attributes
			if ( ! isAllowedAttr( tagName, attrName ) ) {
				attrRemoveList.push( attrName );
				return;
			}

			// for some, specifically links, we don't want to
			// "sanitize" the values because we could mess them up
			// for example, encoding a real URL will break it
			if (
				( ( 'src' === attrName || 'href' === attrName ) && validUrl.isWebUri( value ) ) ||
				( 'iframe' === tagName && 'type' === attrName && isValidYoutubeEmbed( node ) )
			) {
				return;
			}

			// just don't even allow non-url links
			if ( ( 'href' === attrName || 'src' === attrName ) && ! validUrl.isWebUri( value ) ) {
				attrRemoveList.push( attrName );
			}
		} );

		// actually remove the attributes
		attrRemoveList.forEach( name => node.removeAttribute( name ) );

		// of course, all links need to be normalized since
		// they now exist inside of the Calypso context
		if ( 'a' === tagName && node.getAttribute( 'href' ) ) {
			node.setAttribute( 'target', '_blank' );
			node.setAttribute( 'rel', 'external noopener noreferrer' );
		}
	}

	// swap out any nodes that need replacements
	replacements.forEach( ( [ node, newNode ] ) => {
		let child;

		while ( ( child = node.firstChild ) ) {
			newNode.appendChild( child );
		}

		node.parentNode.replaceChild( newNode, node );
	} );

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

	return doc.body.innerHTML;
};
