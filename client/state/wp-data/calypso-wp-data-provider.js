/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { use, RegistryProvider } from '@wordpress/data';

/**
 * Internal dependencies
 */
import calypsoRegistryPlugin from './calypso-registry-plugin';
import calypsoWPDataStore from './calypso-wp-data-store';

class CalypsoWPDataProvider extends Component {
	constructor( props ) {
		super( ...arguments );
		this.updateRegistry( props.calypsoStore );
	}

	updateRegistry( calypsoStore ) {
		this.registry = use( calypsoRegistryPlugin( calypsoStore ) );
		this.registry.registerStore( 'calypso', calypsoWPDataStore );
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
