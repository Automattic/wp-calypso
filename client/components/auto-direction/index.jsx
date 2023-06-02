import { useRtl } from 'i18n-calypso';
import { get } from 'lodash';
import { cloneElement, Children } from 'react';
import { stripHTML } from 'calypso/lib/formatting';
import { isRTLCharacter, isLTRCharacter } from './direction';

const MAX_LENGTH_OF_TEXT_TO_EXAMINE = 100;

const SPACE_CHARACTERS = {
	'\n': true,
	'\r': true,
	'\t': true,
	' ': true,
};

/**
 * Checks whether a character is a space character
 *
 * @param {string} character character to examine
 * @returns {boolean} true if character is a space character, false otherwise
 */
const isSpaceCharacter = ( character ) => !! SPACE_CHARACTERS[ character ];

/**
 * Get index of the first character that is not within a tag
 *
 * @param {string} text text to examine
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

/**
 * Gets text content from react element in case that's a leaf element
 *
 * @param {Element} reactElement react element
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
		const startIndex =
			taglessIndex + MAX_LENGTH_OF_TEXT_TO_EXAMINE < html.length ? taglessIndex : 0;

		return stripHTML( html.substring( startIndex, startIndex + MAX_LENGTH_OF_TEXT_TO_EXAMINE ) );
	}

	// This child is some kind of input
	if ( typeof props.value === 'string' ) {
		return props.value;
	}

	// We have no idea how to get this element's content or it's not a leaf component
	return null;
};

/**
 * Gets the main directionality in a text
 * It returns what kind of characters we had the most, RTL or LTR according to some ratio
 *
 * @param {string}  text  the text to be examined
 * @param {boolean} isRtl whether current language is RTL
 * @returns {string} either 'rtl' or 'ltr'
 */
const getTextMainDirection = ( text, isRtl ) => {
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

	if ( rtlCount + ltrCount === 0 ) {
		return isRtl ? 'rtl' : 'ltr';
	}

	return rtlCount > ltrCount ? 'rtl' : 'ltr';
};

const getDirectionProps = ( child, direction ) => ( {
	direction: direction,
	style: Object.assign( {}, get( child, 'props.style', {} ), {
		direction: direction,
		textAlign: direction === 'rtl' ? 'right' : 'left',
	} ),
} );

const getChildDirection = ( child, isRtl ) => {
	const childContent = getContent( child );

	if ( childContent ) {
		const textMainDirection = getTextMainDirection( childContent, isRtl );
		const userDirection = isRtl ? 'rtl' : 'ltr';

		if ( textMainDirection !== userDirection ) {
			return textMainDirection;
		}
	}

	return null;
};

/**
 * Sets a react component child directionality according to it's text content
 * That function intended to be used recursively with React.Children.map
 * It will set directionality only to the leaf components - because it does so according
 * to text content and only leaf components have those.
 *
 * @param {Element} child element to transform
 * @param {boolean}       isRtl whether current language is RTL
 * @returns {Element} transformed child
 */
const setChildDirection = ( child, isRtl ) => {
	const childDirection = getChildDirection( child, isRtl );

	if ( childDirection ) {
		return cloneElement( child, getDirectionProps( child, childDirection ) );
	}

	if ( child?.props?.children ) {
		const children = Children.map( child.props.children, ( innerChild ) => {
			if ( ! innerChild ) {
				return innerChild;
			}

			if ( typeof innerChild === 'string' ) {
				return innerChild;
			}

			return setChildDirection( innerChild, isRtl );
		} );

		return cloneElement( child, null, children );
	}

	return child;
};

/**
 * Auto direction component that will set direction to child components according to their text content
 *
 * @param {Object.children} props react element props that must contain some children
 * @returns {Element} returns a react element with adjusted children
 */
export default function AutoDirection( { children } ) {
	const isRtl = useRtl();
	return setChildDirection( children, isRtl );
}
