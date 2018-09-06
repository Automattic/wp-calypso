/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { createRegistry, RegistryProvider } from '@wordpress/data';

/**
 * Internal dependencies
 */
import internalsPlugin from './plugins/internals-plugin';
import customStorePlugin from './plugins/custom-store-plugin';
import { registerStores } from './calypso-stores';

class CalypsoWPDataProvider extends Component {
	constructor( props ) {
		super( ...arguments );
		this.updateRegistry( props.calypsoStore );
	}

	updateRegistry( calypsoStore ) {
		this.registry = createRegistry()
			.use( internalsPlugin )
			.use( customStorePlugin );

		registerStores( this.registry, calypsoStore );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.calypsoStore !== this.props.calypsoStore ) {
			this.updateRegistry( this.props.calypsoStore );
		}
	}

	render() {
		return <RegistryProvider value={ this.registry }>{ this.props.children }</RegistryProvider>;
	}
}

export default CalypsoWPDataProvider;
