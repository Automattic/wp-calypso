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
 * @param  {String}  classNames Optional. Space separated classNames. Defaults to ''.
 * @return {Boolean} true if `classNames` has a Gutenberg style class
 */
export function hasStyleClass( classNames = '' ) {
	return classNames.split( ' ' ).some( className => className.startsWith( 'is-style-' ) );
}
