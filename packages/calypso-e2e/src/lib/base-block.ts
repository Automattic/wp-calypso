/**
 * External dependencies
 */
import { ElementHandle } from 'playwright';

/**
 * Base class for asynchronously initializing objects.
 */
export class BaseBlock {
	[ x: string ]: any;
	block: ElementHandle;

	/**
	 * Constructs an instance of a class.
	 *
	 * @param {Page} page The page on which interactions take place.
	 * @param {string} [selector] CSS selector that is expected to be located on page.
	 * @param {string} [url] URL of the page represented by the object.
	 */
	constructor( block: ElementHandle ) {
		this.block = block;
	}
}
