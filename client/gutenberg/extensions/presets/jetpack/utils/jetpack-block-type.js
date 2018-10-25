/**
 * External dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { has, get, pickBy } from 'lodash';

/**
 * Where Jetpack data can be found in WP Admin
 */
const JETPACK_DATA_PATH = [ 'Jetpack_Initial_State' ];

export default class JetpackBlockType {
	constructor( name, config ) {
		this.name = name;
		this.config = config;
		// TODO: how do we access Jetpack Data from calypso?
		this.jetpackData = get(
			'object' === typeof window ? window : null,
			JETPACK_DATA_PATH,
			null
		);
		return this;
	}

	hasRequiredModule = () => {
		const activeModules = pickBy( get( this.jetpackData, 'getModules' ), ( module ) => { return module.activated && module.override !== 'inactive' } );
		return has( activeModules, this.name )
	};

	register() {
		if ( this.jetpackData && ! this.hasRequiredModule() ) {
			return this;
		}

		registerBlockType( 'jetpack/' + this.name, this.config );
	}
}
