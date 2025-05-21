import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getAllowedPluginActions } from '../get-allowed-plugin-actions';

jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'calypso/state/selectors/site-has-feature' );
jest.mock( 'calypso/state/sites/selectors/is-jetpack-site' );

const AUTO_MANAGED_PLUGIN_SLUGS = [ [ 'akismet' ], [ 'jetpack' ], [ 'vaultpress' ] ];

describe( 'getAllowedPluginActions', () => {
	beforeEach( () => {
		jest.resetAllMocks();
	} );

	it.each( [ [ 'randomstring' ], [ 'jetpack' ] ] )(
		'returns true for activation and auto-updates if no site is selected',
		( slug ) => {
			const result = getAllowedPluginActions( {}, { slug } );
			expect( result.activation ).toBe( true );
			expect( result.autoupdate ).toBe( true );
		}
	);

	describe( 'Non-managed plugins', () => {
		beforeEach( () => {
			jest.resetAllMocks();
		} );

		it.each( [ [ 'randomstring' ], [ 'hello-dolly' ] ] )(
			'returns false for activation and auto-updates for non-Jetpack sites',
			( slug ) => {
				isJetpackSite.mockReturnValue( false );
				isSiteAutomatedTransfer.mockReturnValue( false );

				const result = getAllowedPluginActions( {}, { slug }, {} );
				expect( result.activation ).toBe( false );
				expect( result.autoupdate ).toBe( false );
			}
		);

		it.each( [ [ 'randomstring' ], [ 'hello-dolly' ] ] )(
			'returns true for activation and auto-updates for non-Atomic Jetpack sites',
			( slug ) => {
				isJetpackSite.mockReturnValue( true );
				isSiteAutomatedTransfer.mockReturnValue( false );

				const result = getAllowedPluginActions( {}, { slug }, {} );
				expect( result.activation ).toBe( true );
				expect( result.autoupdate ).toBe( true );
			}
		);

		describe( 'Atomic sites', () => {
			beforeEach( () => {
				jest.resetAllMocks();

				isJetpackSite.mockReturnValue( true );
				isSiteAutomatedTransfer.mockReturnValue( true );
			} );

			it.each( [ [ 'randomstring' ], [ 'hello-dolly' ] ] )(
				'returns true for activation and auto-updates when the selected site has "manage plugins" capability',
				( slug ) => {
					siteHasFeature.mockReturnValue( true );

					const result = getAllowedPluginActions( {}, { slug }, {} );
					expect( result.activation ).toBe( true );
					expect( result.autoupdate ).toBe( true );
				}
			);

			it.each( [ [ 'randomstring' ], [ 'hello-dolly' ] ] )(
				'returns true for activation and auto-updates when the selected site does not have "manage plugins" capability',
				( slug ) => {
					siteHasFeature.mockReturnValue( false );

					const result = getAllowedPluginActions( {}, { slug }, {} );
					expect( result.activation ).toBe( false );
					expect( result.autoupdate ).toBe( false );
				}
			);
		} );
	} );

	describe( 'Auto-managed plugins', () => {
		beforeEach( () => {
			jest.resetAllMocks();
		} );

		it.each( AUTO_MANAGED_PLUGIN_SLUGS )(
			'returns false for activation and auto-updates for plugin "%s" on non-Jetpack sites',
			( slug ) => {
				isJetpackSite.mockReturnValue( false );
				isSiteAutomatedTransfer.mockReturnValue( false );

				const result = getAllowedPluginActions( {}, { slug }, {} );
				expect( result.activation ).toBe( false );
				expect( result.autoupdate ).toBe( false );
			}
		);

		it.each( AUTO_MANAGED_PLUGIN_SLUGS )(
			'returns true for activation and auto-updates for plugin "%s" on non-Atomic Jetpack sites',
			( slug ) => {
				isJetpackSite.mockReturnValue( true );
				isSiteAutomatedTransfer.mockReturnValue( false );

				const result = getAllowedPluginActions( {}, { slug }, {} );
				expect( result.activation ).toBe( true );
				expect( result.autoupdate ).toBe( true );
			}
		);

		it.each( AUTO_MANAGED_PLUGIN_SLUGS )(
			'returns true for activation and auto-updates for plugin "%s" on non-Atomic Jetpack sites',
			( slug ) => {
				isJetpackSite.mockReturnValue( true );
				isSiteAutomatedTransfer.mockReturnValue( false );

				const result = getAllowedPluginActions( {}, { slug }, {} );
				expect( result.activation ).toBe( true );
				expect( result.autoupdate ).toBe( true );
			}
		);

		describe( 'Atomic sites', () => {
			beforeEach( () => {
				jest.resetAllMocks();
				isJetpackSite.mockReturnValue( true );
				isSiteAutomatedTransfer.mockReturnValue( true );
			} );

			it.each( AUTO_MANAGED_PLUGIN_SLUGS )(
				'returns false for activation and auto-updates for plugin "%s" when the selected site has "manage plugins" capability',
				( slug ) => {
					siteHasFeature.mockReturnValue( true );

					const result = getAllowedPluginActions( {}, { slug }, {} );
					expect( result.activation ).toBe( false );
					expect( result.autoupdate ).toBe( false );
				}
			);

			it.each( AUTO_MANAGED_PLUGIN_SLUGS )(
				'returns false for activation and auto-updates for plugin "%s" when the selected site does not have "manage plugins" capability',
				( slug ) => {
					siteHasFeature.mockReturnValue( false );

					const result = getAllowedPluginActions( {}, { slug }, {} );
					expect( result.activation ).toBe( false );
					expect( result.autoupdate ).toBe( false );
				}
			);
		} );
	} );
} );
