/**
 * External dependencies
 */

import { isFunction, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import mixinEmitter from 'lib/mixins/emitter';
import core from './core';
import syncInitialize from './sync-initialize';
import asyncInitialize from './async-initialize';

const AVAILABLE_MODULES = {
	syncInitialize,
	asyncInitialize,
};

function combineModules( storeOptions ) {
	const modules = reduce(
		storeOptions,
		( array, moduleOptions, moduleName ) => {
			const module = AVAILABLE_MODULES[ moduleName ]( moduleOptions );
			return array.concat( [ module ] );
		},
		[]
	);

	return [ core(), ...modules ];
}

class Store {
	constructor( options ) {
		this._modules = combineModules( options );
		this._state = null;
		this.initialize();
	}

	get() {
		return this._state;
	}

	_dispatch( action ) {
		if ( isFunction( action ) ) {
			action( this._dispatch.bind( this ), this.get.bind( this ) );
			return;
		}

		this._state = this._modules.reduce( ( result, module ) => {
			return module.reduce( result, action );
		}, this._state );

		this.emit( 'change' );
	}

	_runActionCreators( name, ...rest ) {
		this._modules.forEach( ( module ) => {
			if ( ! module[ name ] ) {
				return;
			}

			this._dispatch( module[ name ]( ...rest ) );
		} );
	}

	initialize() {
		this._runActionCreators( 'initialize' );
	}

	handleFieldChange( options ) {
		this._runActionCreators( 'handleFieldChange', options );
	}
}

mixinEmitter( Store.prototype );

function createStore( options ) {
	return new Store( options );
}

export default createStore;
