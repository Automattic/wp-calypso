/**
 * External dependencies
 */
import { RegistryProvider } from '@wordpress/data';
import React from 'react';

/**
 * Internal dependencies
 */
import { createMockRegistry } from '../../mock-registry';
import stores from '../../mock-registry/stores';

export default function withRegistryProvider( Story, context ) {
	const { site } = context.globals;
	const registry = createMockRegistry( stores[ site ] );

	return (
		<RegistryProvider value={ registry }>
			<Story />
		</RegistryProvider>
	);
}
