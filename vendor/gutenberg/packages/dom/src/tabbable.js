/**
 * Internal dependencies
 */
import { find as findFocusable } from './focusable';

/**
 * Returns the tab index of the given element. In contrast with the tabIndex
 * property, this normalizes the default (0) to avoid browser inconsistencies,
 * operating under the assumption that this function is only ever called with a
 * focusable node.
 *
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=1190261
 *
 * @param {Element} element Element from which to retrieve.
 *
 * @return {?number} Tab index of element (default 0).
 */
function getTabIndex( element ) {
	const tabIndex = element.getAttribute( 'tabindex' );
	return tabIndex === null ? 0 : parseInt( tabIndex, 10 );
}

/**
 * Returns true if the specified element is tabbable, or false otherwise.
 *
 * @param {Element} element Element to test.
 *
 * @return {boolean} Whether element is tabbable.
 */
export function isTabbableIndex( element ) {
	return getTabIndex( element ) !== -1;
}

/**
 * An array map callback, returning an object with the element value and its
 * array index location as properties. This is used to emulate a proper stable
 * sort where equal tabIndex should be left in order of their occurrence in the
 * document.
 *
 * @param {Element} element Element.
 * @param {number}  index   Array index of element.
 *
 * @return {Object} Mapped object with element, index.
 */
function mapElementToObjectTabbable( element, index ) {
	return { element, index };
}

/**
 * An array map callback, returning an element of the given mapped object's
 * element value.
 *
 * @param {Object} object Mapped object with index.
 *
 * @return {Element} Mapped object element.
 */
function mapObjectTabbableToElement( object ) {
	return object.element;
}

/**
 * A sort comparator function used in comparing two objects of mapped elements.
 *
 * @see mapElementToObjectTabbable
 *
 * @param {Object} a First object to compare.
 * @param {Object} b Second object to compare.
 *
 * @return {number} Comparator result.
 */
function compareObjectTabbables( a, b ) {
	const aTabIndex = getTabIndex( a.element );
	const bTabIndex = getTabIndex( b.element );

	if ( aTabIndex === bTabIndex ) {
		return a.index - b.index;
	}

	return aTabIndex - bTabIndex;
}

export function find( context ) {
	return findFocusable( context )
		.filter( isTabbableIndex )
		.map( mapElementToObjectTabbable )
		.sort( compareObjectTabbables )
		.map( mapObjectTabbableToElement );
}
