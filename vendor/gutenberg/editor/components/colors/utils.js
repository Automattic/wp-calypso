/**
 * External dependencies
 */
import { find, kebabCase } from 'lodash';
import deprecated from '@wordpress/deprecated';

/**
 * Returns the color value based on an array of named colors and the definedColor or the customColor value.
 *
 * @param {Array}   colors        Array of color objects containing the "name", "slug" and "color" value as properties.
 * @param {?string} definedColor  A string containing the color slug.
 * @param {?string} customColor   A string containing the customColor value.
 *
 * @return {?string} If definedColor is passed and the name is found in colors it returns the color for that name.
 * 					 Otherwise, the customColor parameter is returned.
 */
export const getColorValue = ( colors, definedColor, customColor ) => {
	if ( definedColor ) {
		let colorObj = find( colors, { slug: definedColor } );

		if ( typeof colorObj === 'undefined' && typeof ( colorObj = find( colors, { name: definedColor } ) ) !== 'undefined' ) {
			deprecated( 'Using color objects without slugs', {
				version: '3.4',
				hint: 'You might want to re-select the color if you have saved in previous versions. The frontend is unaffected by this deprecation.',
			} );
		}

		return colorObj && colorObj.color;
	}
	if ( customColor ) {
		return customColor;
	}
};

/**
* Provided an array of named colors and a color value returns the color name.
*
* @param {Array}   colors      Array of color objects containing the "name" and "color" value as properties.
* @param {?string} colorValue  A string containing the color value.
*
* @return {?string} If colorValue is defined and matches a color part of the colors array, it returns the color name for that color.
*/
export const getColorName = ( colors, colorValue ) => {
	const colorObj = find( colors, { color: colorValue } );
	return colorObj ? colorObj.name : undefined;
};

/**
 * Returns a function that receives the color value and sets it using the attribute for named colors or for custom colors.
 *
 * @param {Array}  colors                   Array of color objects containing the "name", "slug" and "color" value as properties.
 * @param {string} colorAttributeName       Name of the attribute where named colors are stored.
 * @param {string} customColorAttributeName Name of the attribute where custom colors are stored.
 * @param {string} setAttributes            A function that receives an object with the attributes to set.
 *
 * @return {function} A function that receives the color value and sets the attributes necessary to correctly store it.
 */
export const setColorValue = ( colors, colorAttributeName, customColorAttributeName, setAttributes ) =>
	( colorValue ) => {
		const colorObj = find( colors, { color: colorValue } );
		setAttributes( {
			[ colorAttributeName ]: colorObj && colorObj.slug ? colorObj.slug : undefined,
			[ customColorAttributeName ]: colorObj && colorObj.slug ? undefined : colorValue,
		} );
	};

/**
 * Returns a class based on the context a color is being used and its name.
 *
 * @param {string} colorContextName Context/place where color is being used e.g: background, text etc...
 * @param {string} colorName        Name of the color.
 *
 * @return {string} String with the class corresponding to the color in the provided context.
 */
export function getColorClass( colorContextName, colorName ) {
	if ( ! colorContextName || ! colorName ) {
		return;
	}

	return `has-${ kebabCase( colorName ) }-${ colorContextName }`;
}
