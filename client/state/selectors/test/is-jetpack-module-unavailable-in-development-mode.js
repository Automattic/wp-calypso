/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isJetpackModuleUnavailableInDevelopmentMode } from '../';

describe( 'isJetpackModuleUnavailableInDevelopmentMode()', () => {
	it( 'should return null if the site modules are not known', () => {
		const stateTree = {
			jetpack: {
				modules: {
					items: {}
				}
			}
		};

		const unavailable = isJetpackModuleUnavailableInDevelopmentMode( stateTree, 12345678, 'module-a' );
		expect( unavailable ).to.be.null;
	} );

	it( 'should return true for a module that requires connection', () => {
		const stateTree = {
			jetpack: {
				modules: {
					items: {
						12345678: {
							'module-a': {
								module: 'module-a',
								requires_connection: true,
							},
						}
					}
				}
			}
		};

		const unavailable = isJetpackModuleUnavailableInDevelopmentMode( stateTree, 12345678, 'module-a' );
		expect( unavailable ).to.be.true;
	} );

	it( 'should return false for a module that does not require connection', () => {
		const stateTree = {
			jetpack: {
				modules: {
					items: {
						12345678: {
							'module-a': {
								module: 'module-a',
								requires_connection: false,
							},
						}
					}
				}
			}
		};

		const unavailable = isJetpackModuleUnavailableInDevelopmentMode( stateTree, 12345678, 'module-a' );
		expect( unavailable ).to.be.false;
	} );

	it( 'should return false for a module that does not specify whether it requires connection', () => {
		const stateTree = {
			jetpack: {
				modules: {
					items: {
						12345678: {
							'module-a': {
								module: 'module-a',
							},
						}
					}
				}
			}
		};

		const unavailable = isJetpackModuleUnavailableInDevelopmentMode( stateTree, 12345678, 'module-a' );
		expect( unavailable ).to.be.false;
	} );
} );
