/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import has from 'lodash/has';
import get from 'lodash/get';
import pickBy from 'lodash/pickBy';

/**
 * Where Jetpack data can be found in WP Admin
 */
const JETPACK_DATA_PATH = [ 'Jetpack_Editor_Initial_State' ];

export default class JetpackBlockType {
	constructor( { name, config, requiredBlock } ) {
		this.name = name;
		this.config = config;
		this.requiredBlock = requiredBlock;
		this.jetpackData = get(
			'object' === typeof window ? window : null,
			JETPACK_DATA_PATH,
			null
		);
	}

	isBlockAvailable = () => {
		const availableBlocks = pickBy( get( this.jetpackData, 'available_blocks' ), block => block.available );
		return has( availableBlocks, this.requiredBlock );
	};

	registerBlock() {
		if (
			this.jetpackData &&
			this.requiredBlock &&
			! this.isBlockAvailable()
		) {
			return;
		}
		registerBlockType( 'jetpack/' + this.name, this.config );
	}
}
