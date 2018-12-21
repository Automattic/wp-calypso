/**
 * External dependencies
 */
import TokenList from '@wordpress/token-list';
import { find } from 'lodash';

/**
 * Returns the active style from the given className.
 *
 * From @link https://github.com/WordPress/gutenberg/blob/ddac4f3cf8fd311169c7e125411343a437bdbb5a/packages/editor/src/components/block-styles/index.js#L20-L42
 *
 * @param {Array} styles Block style variations.
 * @param {string} className  Class name
 *
 * @return {Object?} The active style.
 */
function getActiveStyle( styles, className ) {
	for ( const style of new TokenList( className ).values() ) {
		if ( style.indexOf( 'is-style-' ) === -1 ) {
			continue;
		}

		const potentialStyleName = style.substring( 9 );
		const activeStyle = find( styles, { name: potentialStyleName } );
		if ( activeStyle ) {
			return activeStyle;
		}
	}

	return find( styles, 'isDefault' );
}

export function getActiveStyleName( styles, className ) {
	const style = getActiveStyle( styles, className );
	return style ? style.name : null;
}

export function getDefaultStyleClass( styles ) {
	const defaultStyle = find( styles, 'isDefault' );
	return defaultStyle ? `is-style-${ defaultStyle.name }` : null;
}

/**
 * Checks if className has a class selector starting with `is-style-`
 * Does not check validity of found style.
 *
 * @param {String} className Selector(s) separated by spaces
 * @return {Boolean} true if `className` has a
 */
export function hasStyleClass( className ) {
	// @TODO check if it has a _valid_ style class
	const tokens = new TokenList( className ).values();
	return tokens.length ? Boolean( tokens.find( token => token.startsWith( 'is-style-' ) ) ) : false;
}
