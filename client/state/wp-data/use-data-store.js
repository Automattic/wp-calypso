/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { Component } from '@wordpress/element';
import { RegistryConsumer } from '@wordpress/data';

class UseDataStore extends Component {
	constructor( props ) {
		super( ...arguments );

		const { registry, dataStore } = props;
		this.update( registry, dataStore );
	}

	componentDidUpdate( prevProps ) {
		const { registry, dataStore } = this.props;

		if ( prevProps.registry !== registry || prevProps.dataStore !== dataStore ) {
			this.update( registry, dataStore );
		}
	}

	update( registry, dataStore ) {
		if ( ! registry.select( dataStore.reducerKey ) ) {
			registry.registerChildStore( dataStore.reducerKey, dataStore );
		}
	}

	render() {
		return null;
	}
}

const UseDataStoreWrapper = props => (
	<RegistryConsumer>
		{ registry => <UseDataStore { ...props } registry={ registry } /> }
	</RegistryConsumer>
);

export default UseDataStoreWrapper;
