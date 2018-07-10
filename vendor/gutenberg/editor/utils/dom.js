/**
 * External dependencies
 */
import 'element-closest';

/**
 * Given a block UID, returns the corresponding DOM node for the block, if
 * exists. As much as possible, this helper should be avoided, and used only
 * in cases where isolated behaviors need remote access to a block node.
 *
 * @param {string} uid Block UID.
 *
 * @return {Element} Block DOM node.
 */
export function getBlockDOMNode( uid ) {
	return document.querySelector( '[data-block="' + uid + '"]' );
}

/**
 * Given a block UID, returns the corresponding DOM node for the block focusable
 * wrapper, if exists. As much as possible, this helper should be avoided, and
 * used only in cases where isolated behaviors need remote access to a block node.
 *
 * @param {string} uid Block UID.
 *
 * @return {Element} Block DOM node.
 */
export function getBlockFocusableWrapper( uid ) {
	return getBlockDOMNode( uid ).closest( '.editor-block-list__block' );
}

/**
 * Returns true if the given HTMLElement is a block focus stop. Blocks without
 * their own text fields rely on the focus stop to be keyboard navigable.
 *
 * @param {HTMLElement} element Element to test.
 *
 * @return {boolean} Whether element is a block focus stop.
 */
export function isBlockFocusStop( element ) {
	return element.classList.contains( 'editor-block-list__block' );
}

/**
 * Returns true if two elements are contained within the same block.
 *
 * @param {HTMLElement} a First element.
 * @param {HTMLElement} b Second element.
 *
 * @return {boolean} Whether elements are in the same block.
 */
export function isInSameBlock( a, b ) {
	return a.closest( '[data-block]' ) === b.closest( '[data-block]' );
}

/**
 * Returns true if the given HTMLElement contains inner blocks (an InnerBlocks
 * element).
 *
 * @param {HTMLElement} element Element to test.
 *
 * @return {boolean} Whether element contains inner blocks.
 */
export function hasInnerBlocksContext( element ) {
	return !! element.querySelector( '.editor-block-list__layout' );
}
