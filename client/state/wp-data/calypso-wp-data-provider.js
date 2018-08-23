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
	constructor() {
		super( ...arguments );
		this.registry = undefined;
	}

	updateRegistry( calypsoStore ) {
		this.registry = use( calypsoRegistryPlugin( calypsoStore ) );
		this.registry.registerStore( 'calypso', calypsoWPDataStore );
	}

	componentDidMount() {
		this.updateRegistry( this.props.calypsoStore );
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
