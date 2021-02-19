/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isJetpackModuleUnavailableInDevelopmentMode from 'calypso/state/selectors/is-jetpack-module-unavailable-in-development-mode';

describe( 'isJetpackModuleUnavailableInDevelopmentMode()', () => {
	test( 'should return null if the site modules are not known', () => {
		const stateTree = {
			jetpack: {
				modules: {
					items: {},
				},
			},
		};

		const unavailable = isJetpackModuleUnavailableInDevelopmentMode(
			stateTree,
			12345678,
			'module-a'
		);
		expect( unavailable ).to.be.null;
	} );

	test( 'should return true for a module that requires connection', () => {
		const stateTree = {
			jetpack: {
				modules: {
					items: {
						12345678: {
							'module-a': {
								module: 'module-a',
								requires_connection: true,
							},
						},
					},
				},
			},
		};

		const unavailable = isJetpackModuleUnavailableInDevelopmentMode(
			stateTree,
			12345678,
			'module-a'
		);
		expect( unavailable ).to.be.true;
	} );

	test( 'should return false for a module that does not require connection', () => {
		const stateTree = {
			jetpack: {
				modules: {
					items: {
						12345678: {
							'module-a': {
								module: 'module-a',
								requires_connection: false,
							},
						},
					},
				},
			},
		};

		const unavailable = isJetpackModuleUnavailableInDevelopmentMode(
			stateTree,
			12345678,
			'module-a'
		);
		expect( unavailable ).to.be.false;
	} );

	test( 'should return false for a module that does not specify whether it requires connection', () => {
		const stateTree = {
			jetpack: {
				modules: {
					items: {
						12345678: {
							'module-a': {
								module: 'module-a',
							},
						},
					},
				},
			},
		};

		const unavailable = isJetpackModuleUnavailableInDevelopmentMode(
			stateTree,
			12345678,
			'module-a'
		);
		expect( unavailable ).to.be.false;
	} );
} );
