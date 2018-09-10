/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { RegistryProvider } from '@wordpress/data';

/**
 * Internal dependencies
 */
import registry, { updateCalypsoStore } from './registry';

class CalypsoWPDataProvider extends Component {
	constructor( props ) {
		super( ...arguments );
		updateCalypsoStore( props.calypsoStore );
	}

	componentDidUpdate() {
		updateCalypsoStore( this.props.calypsoStore );
	}

	render() {
		return <RegistryProvider value={ registry }>{ this.props.children }</RegistryProvider>;
	}
}

export default CalypsoWPDataProvider;
