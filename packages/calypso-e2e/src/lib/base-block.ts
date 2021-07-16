/**
 * External dependencies
 */
import { ElementHandle } from 'playwright';

/**
 * Base class for the Block type objects.
 */
export class BaseBlock {
	[ x: string ]: any;
	static block: ElementHandle;

	/**
	 * Constructs a concrete instance of a block.
	 *
	 * This base class accepts an ElementHandle reference to the block to be interacted with.
	 *
	 * @param {ElementHandle } block Handle referencing the block as inserted on the Gutenberg editor.
	 */
	constructor( block: ElementHandle ) {
		this.block = block;
	}
}
