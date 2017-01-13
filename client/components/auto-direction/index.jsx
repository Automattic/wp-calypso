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
		return props.dangerouslySetInnerHTML.__html
			? stripHTML( props.dangerouslySetInnerHTML.__html.substring( 0, Math.floor( MAX_LENGTH_OF_TEXT_TO_EXAMINE * 1.25 ) ) )
			: '';
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
