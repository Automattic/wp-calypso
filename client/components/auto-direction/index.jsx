/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import userModule from 'lib/user';
import { stripHTML } from 'lib/formatting';

const user = userModule();

/***
 * Gets text content from react element in case that's a leaf element
 * @param {React.Element} reactElement react element
 * @returns {string|null} returns a text content of the react element or null if it's not a leaf element
 */
const getContent = ( reactElement ) => {
	const { props } = reactElement;

	// The child is a text node
	if ( typeof props.children === 'string' ) {
		return props.children;
	}

	// This child has it's content set to external HTML
	if ( typeof props.dangerouslySetInnerHTML === 'object' ) {
		// Strip tags because we're only interested in the text, not markup
		return props.dangerouslySetInnerHTML.__html
			? stripHTML( props.dangerouslySetInnerHTML.__html )
			: '';
	}

	// This child is some kind of input
	if ( typeof props.value === 'string' ) {
		return props.value;
	}

	// We have no idea how to get this element's content or it's not a leaf component
	return null;
};

// Adopted from from: https://github.com/twitter/RTLtextarea/blob/master/src/RTLText.module.js#L25
const rtlCharacterRanges = [
	{
		name: 'Hebrew',
		start: 0x590,
		end: 0x5FF
	},
	{
		name: 'Arabic',
		start: 0x600,
		end: 0x6FF
	},
	{
		name: 'Syriac',
		start: 0x700,
		end: 0x74F
	},
	{
		name: 'Arabic Supplement',
		start: 0x750,
		end: 0x77F
	},
	{
		name: 'Thaana',
		start: 0x780,
		end: 0x7BF
	},
	{
		name: 'N\'Ko',
		start: 0x7C0,
		end: 0x7FF
	},
	{
		name: 'Samaritan',
		start: 0x800,
		end: 0x83F
	},
	{
		name: 'Arabic Extended-A',
		start: 0x8A0,
		end: 0x8FF
	},
	{
		name: 'Hebrew presentation forms',
		start: 0xFB1D,
		end: 0xFB4F
	},
	{
		name: 'Arabic presentation forms A',
		start: 0xFB50,
		end: 0xFDFF
	},
	{
		name: 'Arabic presentation forms B',
		start: 0xFE70,
		end: 0xFEFF
	},
];

const RTL_THRESHOLD = 0.5;
const MAX_LENGTH_OF_TEXT_TO_EXAMINE = 100;

const isRTLCharacter = ( character ) => {
	const characterCode = character.charCodeAt( 0 );
	return rtlCharacterRanges.some( range => range.start <= characterCode && range.end >= characterCode );
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
	const examinedLength = Math.min( MAX_LENGTH_OF_TEXT_TO_EXAMINE, text.length );
	for ( let i = 0; i < examinedLength; i++ ) {
		rtlCount += isRTLCharacter( text[ i ] ) ? 1 : 0;
	}

	return ( rtlCount / examinedLength > RTL_THRESHOLD ) ? 'rtl' : 'ltr';
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

	return React.cloneElement( child, {
		children: React.Children.map( child.props.children, setChildDirection )
	} );
};

/***
 * Auto direction component that will set direction to child components according to their text content
 * @param {Object.children} props react element props that must contain some children
 * @returns {React.Element} returns a react element with adjusted children
 */
const AutoDirection = ( props ) => {
	const { children } = props;
	const directionedChildren = React.Children.map( children, setChildDirection );

	return <div>{ directionedChildren }</div>;
};

AutoDirection.propTypes = {
	children: PropTypes.oneOfType( [
		PropTypes.arrayOf( PropTypes.node ),
		PropTypes.node
	] )
};

export default AutoDirection;
