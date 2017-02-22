/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import userModule from 'lib/user';
import { stripHTML } from 'lib/formatting';
import { isRTLCharacter, isLTRCharacter } from './direction';

const user = userModule();

const MAX_LENGTH_OF_TEXT_TO_EXAMINE = 100;

const SPACE_CHARACTERS = {
	'\n': true,
	'\r': true,
	'\t': true,
	' ': true,
};

/***
 * Checks whether a character is a space character
 * @param {String} character character to examine
 * @returns {bool} true if character is a space character, false otherwise
 */
const isSpaceCharacter = character => !! SPACE_CHARACTERS[ character ];

/***
 * Get index of the first character that is not within a tag
 * @param {String} text text to examine
 * @returns {number} index not within a tag
 */
const getTaglessIndex = ( text ) => {
	let isTagOpen = false;

	for ( let i = 0; i < text.length; i++ ) {
		// skip spaces
		if ( isSpaceCharacter( text[ i ] ) ) {
			continue;
		}

		if ( text[ i ] === '<' ) {
			isTagOpen = true;
		} else if ( isTagOpen && text[ i ] === '>' ) {
			isTagOpen = false;
		} else if ( ! isTagOpen ) {
			return i;
		}
	}

	return 0;
};

/***
 * Gets text content from react element in case that's a leaf element
 * @param {React.Element} reactElement react element
 * @returns {string|null} returns a text content of the react element or null if it's not a leaf element
 */
const getContent = ( reactElement ) => {
	if ( ! reactElement ) {
		return null;
	}
	const { props } = reactElement;

	if ( ! props ) {
		return null;
	}

	// The child is a text node
	if ( typeof props.children === 'string' ) {
		return props.children;
	}

	// This child has it's content set to external HTML
	if ( typeof props.dangerouslySetInnerHTML === 'object' ) {
		// Strip tags because we're only interested in the text, not markup
		// We examine from the first position without tags of the string, so we won't get an empty text
		// because we might get only tags in the beginning
		const html = props.dangerouslySetInnerHTML.__html;
		if ( ! html ) {
			return '';
		}

		const taglessIndex = getTaglessIndex( html );
		const startIndex = taglessIndex + MAX_LENGTH_OF_TEXT_TO_EXAMINE < html.length ? taglessIndex : 0;

		return stripHTML( html.substring( startIndex, startIndex + MAX_LENGTH_OF_TEXT_TO_EXAMINE ) );
	}

	// This child is some kind of input
	if ( typeof props.value === 'string' ) {
		return props.value;
	}

	// We have no idea how to get this element's content or it's not a leaf component
	return null;
};

/***
 * Gets the main directionality in a text
 * It returns what kind of characters we had the most, RTL or LTR according to some ratio
 *
 * @param {string} text the text to be examined
 * @returns {string} either 'rtl' or 'ltr'
 */
const getTextMainDirection = ( text ) => {
	let rtlCount = 0;
	let ltrCount = 0;

	const examinedLength = Math.min( MAX_LENGTH_OF_TEXT_TO_EXAMINE, text.length );
	for ( let i = 0; i < examinedLength; i++ ) {
		if ( isRTLCharacter( text[ i ] ) ) {
			rtlCount++;
		} else if ( isLTRCharacter( text[ i ] ) ) {
			ltrCount++;
		}
	}

	if ( ( rtlCount + ltrCount ) === 0 ) {
		return user.isRTL() ? 'rtl' : 'ltr';
	}

	return rtlCount > ltrCount ? 'rtl' : 'ltr';
};

/***
 * Sets a react component child directionality according to it's text content
 * That function intended to be used recursively with React.Children.map
 * It will set directionality only to the leaf components - because it does so according
 * to text content and only leaf components have those.
 *
 * @param {React.Element} child
 * @returns {React.Element} transformed child
 */
const setChildDirection = ( child ) => {
	const childContent = getContent( child );

	if ( childContent ) {
		const textMainDirection = getTextMainDirection( childContent );
		const userDirection = user.isRTL() ? 'rtl' : 'ltr';

		if ( textMainDirection !== userDirection ) {
			return React.cloneElement( child, {
				direction: textMainDirection,
				style: Object.assign( {}, child.props.style, {
					direction: textMainDirection,
					textAlign: textMainDirection === 'rtl' ? 'right' : 'left'
				} )
			} );
		}

		return child;
	}

	if ( child && child.props.children ) {
		return React.cloneElement( child, {
			children: React.Children.map( child.props.children, setChildDirection )
		} );
	}

	return child;
};

/***
 * Auto direction component that will set direction to child components according to their text content
 * @param {Object.children} props react element props that must contain some children
 * @returns {React.Element} returns a react element with adjusted children
 */
const AutoDirection = ( props ) => {
	const { children } = props;
	const directionedChild = setChildDirection( children );

	return directionedChild;
};

AutoDirection.propTypes = {
	children: PropTypes.node,
};

export default AutoDirection;
