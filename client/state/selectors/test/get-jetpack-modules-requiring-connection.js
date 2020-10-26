/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getJetpackModulesRequiringConnection from 'calypso/state/selectors/get-jetpack-modules-requiring-connection';

describe( 'getJetpackModulesRequiringConnection()', () => {
	test( 'should return null if the site has never been fetched', () => {
		const stateTree = {
			jetpack: {
				modules: {
					items: {},
				},
			},
		};

		const modules = getJetpackModulesRequiringConnection( stateTree, 12345678 );
		expect( modules ).to.be.null;
	} );

	test( 'should return the modules that require connection for a known site', () => {
		const stateTree = {
			jetpack: {
				modules: {
					items: {
						12345678: {
							'module-a': {
								module: 'module-a',
								requires_connection: true,
							},
							'module-b': {
								module: 'module-b',
								requires_connection: false,
							},
							'module-c': {
								module: 'module-c',
							},
						},
					},
				},
			},
		};

		const modules = getJetpackModulesRequiringConnection( stateTree, 12345678 );
		expect( modules ).to.eql( [ 'module-a' ] );
	} );
} );
