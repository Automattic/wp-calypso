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
const JETPACK_DATA_PATH = [ 'Jetpack_Initial_State' ];

export default class JetpackBlockType {
	constructor( name, config ) {
		this.name = name;
		this.config = config;
		this.jetpackData = get(
			'object' === typeof window ? window : null,
			JETPACK_DATA_PATH,
			null
		);
	}

	hasRequiredModule = () => {
		const activeModules = pickBy( get( this.jetpackData, 'getModules' ), module => module.activated && module.override !== 'inactive' );
		return has( activeModules, this.name )
	};

	register() {
		if ( this.jetpackData && ! this.hasRequiredModule() ) {
			return;
		}
		registerBlockType( 'jetpack/' + this.name, this.config );
	}
}
