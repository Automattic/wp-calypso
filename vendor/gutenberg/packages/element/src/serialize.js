/**
 * Parts of this source were derived and modified from fast-react-render,
 * released under the MIT license.
 *
 * https://github.com/alt-j/fast-react-render
 *
 * Copyright (c) 2016 Andrey Morozov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * External dependencies
 */
import { flowRight, isEmpty, castArray, omit, startsWith, kebabCase } from 'lodash';

/**
 * WordPress dependencies
 */
import deprecated from '@wordpress/deprecated';

/**
 * Internal dependencies
 */
import { Fragment, RawHTML } from './';

/**
 * Valid attribute types.
 *
 * @type {Set}
 */
const ATTRIBUTES_TYPES = new Set( [
	'string',
	'boolean',
	'number',
] );

/**
 * Element tags which can be self-closing.
 *
 * @type {Set}
 */
const SELF_CLOSING_TAGS = new Set( [
	'area',
	'base',
	'br',
	'col',
	'command',
	'embed',
	'hr',
	'img',
	'input',
	'keygen',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr',
] );

/**
 * Boolean attributes are attributes whose presence as being assigned is
 * meaningful, even if only empty.
 *
 * See: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
 * Extracted from: https://html.spec.whatwg.org/multipage/indices.html#attributes-3
 *
 * Object.keys( [ ...document.querySelectorAll( '#attributes-1 > tbody > tr' ) ]
 *     .filter( ( tr ) => tr.lastChild.textContent.indexOf( 'Boolean attribute' ) !== -1 )
 *     .reduce( ( result, tr ) => Object.assign( result, {
 *         [ tr.firstChild.textContent.trim() ]: true
 *     } ), {} ) ).sort();
 *
 * @type {Set}
 */
const BOOLEAN_ATTRIBUTES = new Set( [
	'allowfullscreen',
	'allowpaymentrequest',
	'allowusermedia',
	'async',
	'autofocus',
	'autoplay',
	'checked',
	'controls',
	'default',
	'defer',
	'disabled',
	'formnovalidate',
	'hidden',
	'ismap',
	'itemscope',
	'loop',
	'multiple',
	'muted',
	'nomodule',
	'novalidate',
	'open',
	'playsinline',
	'readonly',
	'required',
	'reversed',
	'selected',
	'typemustmatch',
] );

/**
 * Enumerated attributes are attributes which must be of a specific value form.
 * Like boolean attributes, these are meaningful if specified, even if not of a
 * valid enumerated value.
 *
 * See: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#enumerated-attribute
 * Extracted from: https://html.spec.whatwg.org/multipage/indices.html#attributes-3
 *
 * Object.keys( [ ...document.querySelectorAll( '#attributes-1 > tbody > tr' ) ]
 *     .filter( ( tr ) => /^("(.+?)";?\s*)+/.test( tr.lastChild.textContent.trim() ) )
 *     .reduce( ( result, tr ) => Object.assign( result, {
 *         [ tr.firstChild.textContent.trim() ]: true
 *     } ), {} ) ).sort();
 *
 * Some notable omissions:
 *
 *  - `alt`: https://blog.whatwg.org/omit-alt
 *
 * @type {Set}
 */
const ENUMERATED_ATTRIBUTES = new Set( [
	'autocapitalize',
	'autocomplete',
	'charset',
	'contenteditable',
	'crossorigin',
	'decoding',
	'dir',
	'draggable',
	'enctype',
	'formenctype',
	'formmethod',
	'http-equiv',
	'inputmode',
	'kind',
	'method',
	'preload',
	'scope',
	'shape',
	'spellcheck',
	'translate',
	'type',
	'wrap',
] );

/**
 * Set of CSS style properties which support assignment of unitless numbers.
 * Used in rendering of style properties, where `px` unit is assumed unless
 * property is included in this set or value is zero.
 *
 * Generated via:
 *
 * Object.entries( document.createElement( 'div' ).style )
 *     .filter( ( [ key ] ) => (
 *         ! /^(webkit|ms|moz)/.test( key ) &&
 *         ( e.style[ key ] = 10 ) &&
 *         e.style[ key ] === '10'
 *     ) )
 *     .map( ( [ key ] ) => key )
 *     .sort();
 *
 * @type {Set}
 */
const CSS_PROPERTIES_SUPPORTS_UNITLESS = new Set( [
	'animation',
	'animationIterationCount',
	'baselineShift',
	'borderImageOutset',
	'borderImageSlice',
	'borderImageWidth',
	'columnCount',
	'cx',
	'cy',
	'fillOpacity',
	'flexGrow',
	'flexShrink',
	'floodOpacity',
	'fontWeight',
	'gridColumnEnd',
	'gridColumnStart',
	'gridRowEnd',
	'gridRowStart',
	'lineHeight',
	'opacity',
	'order',
	'orphans',
	'r',
	'rx',
	'ry',
	'shapeImageThreshold',
	'stopOpacity',
	'strokeDasharray',
	'strokeDashoffset',
	'strokeMiterlimit',
	'strokeOpacity',
	'strokeWidth',
	'tabSize',
	'widows',
	'x',
	'y',
	'zIndex',
	'zoom',
] );

/**
 * Returns a string with ampersands escaped. Note that this is an imperfect
 * implementation, where only ampersands which do not appear as a pattern of
 * named, decimal, or hexadecimal character references are escaped. Invalid
 * named references (i.e. ambiguous ampersand) are are still permitted.
 *
 * @link https://w3c.github.io/html/syntax.html#character-references
 * @link https://w3c.github.io/html/syntax.html#ambiguous-ampersand
 * @link https://w3c.github.io/html/syntax.html#named-character-references
 *
 * @param {string} value Original string.
 *
 * @return {string} Escaped string.
 */
export function escapeAmpersand( value ) {
	return value.replace( /&(?!([a-z0-9]+|#[0-9]+|#x[a-f0-9]+);)/gi, '&amp;' );
}

/**
 * Returns a string with quotation marks replaced.
 *
 * @param {string} value Original string.
 *
 * @return {string} Escaped string.
 */
export function escapeQuotationMark( value ) {
	return value.replace( /"/g, '&quot;' );
}

/**
 * Returns a string with less-than sign replaced.
 *
 * @param {string} value Original string.
 *
 * @return {string} Escaped string.
 */
export function escapeLessThan( value ) {
	return value.replace( /</g, '&lt;' );
}

/**
 * Returns an escaped attribute value.
 *
 * @link https://w3c.github.io/html/syntax.html#elements-attributes
 *
 * "[...] the text cannot contain an ambiguous ampersand [...] must not contain
 * any literal U+0022 QUOTATION MARK characters (")"
 *
 * @param {string} value Attribute value.
 *
 * @return {string} Escaped attribute value.
 */
export const escapeAttribute = flowRight( [
	escapeAmpersand,
	escapeQuotationMark,
] );

/**
 * Returns an escaped HTML element value.
 *
 * @link https://w3c.github.io/html/syntax.html#writing-html-documents-elements
 *
 * "the text must not contain the character U+003C LESS-THAN SIGN (<) or an
 * ambiguous ampersand."
 *
 * @param {string} value Element value.
 *
 * @return {string} Escaped HTML element value.
 */
export const escapeHTML = flowRight( [
	escapeAmpersand,
	escapeLessThan,
] );

/**
 * Returns true if the specified string is prefixed by one of an array of
 * possible prefixes.
 *
 * @param {string}   string   String to check.
 * @param {string[]} prefixes Possible prefixes.
 *
 * @return {boolean} Whether string has prefix.
 */
export function hasPrefix( string, prefixes ) {
	return prefixes.some( ( prefix ) => string.indexOf( prefix ) === 0 );
}

/**
 * Returns true if the given prop name should be ignored in attributes
 * serialization, or false otherwise.
 *
 * @param {string} attribute Attribute to check.
 *
 * @return {boolean} Whether attribute should be ignored.
 */
function isInternalAttribute( attribute ) {
	return 'key' === attribute || 'children' === attribute;
}

/**
 * Returns the normal form of the element's attribute value for HTML.
 *
 * @param {string} attribute Attribute name.
 * @param {*}      value     Non-normalized attribute value.
 *
 * @return {string} Normalized attribute value.
 */
function getNormalAttributeValue( attribute, value ) {
	switch ( attribute ) {
		case 'style':
			return renderStyle( value );
	}

	return value;
}

/**
 * Returns the normal form of the element's attribute name for HTML.
 *
 * @param {string} attribute Non-normalized attribute name.
 *
 * @return {string} Normalized attribute name.
 */
function getNormalAttributeName( attribute ) {
	switch ( attribute ) {
		case 'htmlFor':
			return 'for';

		case 'className':
			return 'class';
	}

	return attribute.toLowerCase();
}

/**
 * Returns the normal form of the style property name for HTML.
 *
 * - Converts property names to kebab-case, e.g. 'backgroundColor' → 'background-color'
 * - Leaves custom attributes alone, e.g. '--myBackgroundColor' → '--myBackgroundColor'
 * - Converts vendor-prefixed property names to -kebab-case, e.g. 'MozTransform' → '-moz-transform'
 *
 * @param {string} property Property name.
 *
 * @return {string} Normalized property name.
 */
function getNormalStylePropertyName( property ) {
	if ( startsWith( property, '--' ) ) {
		return property;
	}

	if ( hasPrefix( property, [ 'ms', 'O', 'Moz', 'Webkit' ] ) ) {
		return '-' + kebabCase( property );
	}

	return kebabCase( property );
}

/**
 * Returns the normal form of the style property value for HTML. Appends a
 * default pixel unit if numeric, not a unitless property, and not zero.
 *
 * @param {string} property Property name.
 * @param {*}      value    Non-normalized property value.
 *
 * @return {*} Normalized property value.
 */
function getNormalStylePropertyValue( property, value ) {
	if ( typeof value === 'number' && 0 !== value &&
			! CSS_PROPERTIES_SUPPORTS_UNITLESS.has( property ) ) {
		return value + 'px';
	}

	return value;
}

/**
 * Serializes a React element to string.
 *
 * @param {WPElement} element Element to serialize.
 * @param {?Object}   context Context object.
 *
 * @return {string} Serialized element.
 */
export function renderElement( element, context = {} ) {
	if ( null === element || undefined === element || false === element ) {
		return '';
	}

	if ( Array.isArray( element ) ) {
		return renderChildren( element, context );
	}

	switch ( typeof element ) {
		case 'string':
			return escapeHTML( element );

		case 'number':
			return element.toString();
	}

	const { type: tagName, props } = element;

	switch ( tagName ) {
		case Fragment:
			return renderChildren( props.children, context );

		case RawHTML:
			const { children, ...wrapperProps } = props;

			return renderNativeComponent(
				isEmpty( wrapperProps ) ? null : 'div',
				{
					...wrapperProps,
					dangerouslySetInnerHTML: { __html: children },
				},
				context
			);
	}

	switch ( typeof tagName ) {
		case 'string':
			return renderNativeComponent( tagName, props, context );

		case 'function':
			if ( tagName.prototype && typeof tagName.prototype.render === 'function' ) {
				return renderComponent( tagName, props, context );
			}

			return renderElement( tagName( props, context ), context );
	}

	return '';
}

/**
 * Serializes a native component type to string.
 *
 * @param {?string} type    Native component type to serialize, or null if
 *                          rendering as fragment of children content.
 * @param {Object}  props   Props object.
 * @param {?Object} context Context object.
 *
 * @return {string} Serialized element.
 */
export function renderNativeComponent( type, props, context = {} ) {
	let content = '';
	if ( type === 'textarea' && props.hasOwnProperty( 'value' ) ) {
		// Textarea children can be assigned as value prop. If it is, render in
		// place of children. Ensure to omit so it is not assigned as attribute
		// as well.
		content = renderChildren( props.value, context );
		props = omit( props, 'value' );
	} else if ( props.dangerouslySetInnerHTML &&
			typeof props.dangerouslySetInnerHTML.__html === 'string' ) {
		// Dangerous content is left unescaped.
		content = props.dangerouslySetInnerHTML.__html;
	} else if ( typeof props.children !== 'undefined' ) {
		content = renderChildren( props.children, context );
	}

	if ( ! type ) {
		return content;
	}

	const attributes = renderAttributes( props );

	if ( SELF_CLOSING_TAGS.has( type ) ) {
		return '<' + type + attributes + '/>';
	}

	return '<' + type + attributes + '>' + content + '</' + type + '>';
}

/**
 * Serializes a non-native component type to string.
 *
 * @param {Function} Component Component type to serialize.
 * @param {Object}   props     Props object.
 * @param {?Object}  context   Context object.
 *
 * @return {string} Serialized element
 */
export function renderComponent( Component, props, context = {} ) {
	const instance = new Component( props, context );

	if ( typeof instance.componentWillMount === 'function' ) {
		instance.componentWillMount();
		deprecated( 'componentWillMount', {
			version: '3.3',
			alternative: 'the constructor',
			plugin: 'Gutenberg',
		} );
	}

	if ( typeof instance.getChildContext === 'function' ) {
		Object.assign( context, instance.getChildContext() );
	}

	const html = renderElement( instance.render(), context );

	return html;
}

/**
 * Serializes an array of children to string.
 *
 * @param {Array}   children Children to serialize.
 * @param {?Object} context  Context object.
 *
 * @return {string} Serialized children.
 */
function renderChildren( children, context = {} ) {
	let result = '';

	children = castArray( children );

	for ( let i = 0; i < children.length; i++ ) {
		const child = children[ i ];

		result += renderElement( child, context );
	}

	return result;
}

/**
 * Renders a props object as a string of HTML attributes.
 *
 * @param {Object} props Props object.
 *
 * @return {string} Attributes string.
 */
export function renderAttributes( props ) {
	let result = '';

	for ( const key in props ) {
		const attribute = getNormalAttributeName( key );
		let value = getNormalAttributeValue( key, props[ key ] );

		// If value is not of serializeable type, skip.
		if ( ! ATTRIBUTES_TYPES.has( typeof value ) ) {
			continue;
		}

		// Don't render internal attribute names.
		if ( isInternalAttribute( key ) ) {
			continue;
		}

		const isBooleanAttribute = BOOLEAN_ATTRIBUTES.has( attribute );

		// Boolean attribute should be omitted outright if its value is false.
		if ( isBooleanAttribute && value === false ) {
			continue;
		}

		const isMeaningfulAttribute = (
			isBooleanAttribute ||
			hasPrefix( key, [ 'data-', 'aria-' ] ) ||
			ENUMERATED_ATTRIBUTES.has( attribute )
		);

		// Only write boolean value as attribute if meaningful.
		if ( typeof value === 'boolean' && ! isMeaningfulAttribute ) {
			continue;
		}

		result += ' ' + attribute;

		// Boolean attributes should write attribute name, but without value.
		// Mere presence of attribute name is effective truthiness.
		if ( isBooleanAttribute ) {
			continue;
		}

		if ( typeof value === 'string' ) {
			value = escapeAttribute( value );
		}

		result += '="' + value + '"';
	}

	return result;
}

/**
 * Renders a style object as a string attribute value.
 *
 * @param {Object} style Style object.
 *
 * @return {string} Style attribute value.
 */
export function renderStyle( style ) {
	let result;

	for ( const property in style ) {
		const value = style[ property ];
		if ( null === value || undefined === value ) {
			continue;
		}

		if ( result ) {
			result += ';';
		} else {
			result = '';
		}

		const normalName = getNormalStylePropertyName( property );
		const normalValue = getNormalStylePropertyValue( property, value );
		result += normalName + ':' + normalValue;
	}

	return result;
}

export default renderElement;
