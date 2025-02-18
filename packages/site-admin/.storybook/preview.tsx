import { RegistryProvider } from '@wordpress/data';
import React from 'react';

/**
 * Internal dependencies
 */
import './style.scss';
import { createMockRegistry } from './mock-registry';
import stores from './mock-registry/stores';

const siteKeys = Object.keys( stores );

const withRegistryProvider = ( Story, context ) => {
	const { site } = context.globals;
	const registry = createMockRegistry( stores[ site ] );

	return (
		<RegistryProvider value={ registry }>
			<Story />
		</RegistryProvider>
	);
};

export const globalTypes = {
	site: {
		name: 'Site',
		description: 'Site for testing',
		defaultValue: siteKeys[ 0 ],
		toolbar: {
			icon: 'home',
			items: siteKeys,
		},
	},
};

export const decorators = [ withRegistryProvider ];
