import { getAllowedPluginActions } from '../get-allowed-plugin-actions';
import type { SiteWithPluginData } from '../../use-plugin';

function makeSite( {
	isAtomic = false,
	jetpack = false,
	managed = false,
	hasManagePlugins = false,
}: {
	isAtomic?: boolean;
	jetpack?: boolean;
	managed?: boolean;
	hasManagePlugins?: boolean;
} = {} ): SiteWithPluginData {
	return {
		is_wpcom_atomic: isAtomic,
		jetpack,
		isPluginManaged: managed,
		plan: { features: { active: hasManagePlugins ? [ 'manage-plugins' ] : ( [] as string[] ) } },
	} as SiteWithPluginData;
}

describe( 'getAllowedPluginActions', () => {
	// DOTMSD-1304: managed (symlinked) plugins should be deletable, except core.
	describe( 'canDelete', () => {
		test( 'allows deleting a managed (symlinked) plugin on Atomic with manage-plugins', () => {
			const site = makeSite( { isAtomic: true, managed: true, hasManagePlugins: true } );
			const { canDelete, autoupdate } = getAllowedPluginActions( site, 'some-plugin' );

			expect( canDelete ).toBe( true );
			// Autoupdate stays disabled for managed plugins (managed by WordPress.com).
			expect( autoupdate ).toBe( false );
		} );

		test( 'keeps the auto-managed core plugins non-deletable on Atomic', () => {
			const site = makeSite( { isAtomic: true, managed: true, hasManagePlugins: true } );

			expect( getAllowedPluginActions( site, 'jetpack' ).canDelete ).toBe( false );
			expect( getAllowedPluginActions( site, 'akismet' ).canDelete ).toBe( false );
			expect( getAllowedPluginActions( site, 'vaultpress' ).canDelete ).toBe( false );
		} );

		test( 'allows deleting a non-managed plugin on Atomic with manage-plugins', () => {
			const site = makeSite( { isAtomic: true, managed: false, hasManagePlugins: true } );

			expect( getAllowedPluginActions( site, 'some-plugin' ).canDelete ).toBe( true );
		} );

		test( 'blocks deletion on Atomic without the manage-plugins feature', () => {
			const site = makeSite( { isAtomic: true, managed: true, hasManagePlugins: false } );

			expect( getAllowedPluginActions( site, 'some-plugin' ).canDelete ).toBe( false );
		} );

		test( 'allows deletion on a non-Atomic Jetpack site', () => {
			const site = makeSite( { isAtomic: false, jetpack: true } );

			expect( getAllowedPluginActions( site, 'some-plugin' ).canDelete ).toBe( true );
		} );
	} );

	// DOTMSD-1304: flags the core plugins that WordPress.com manages so the UI can
	// explain why they can't be deleted.
	describe( 'isAutoManagedPlugin', () => {
		test( 'flags the core plugins on Atomic', () => {
			const site = makeSite( { isAtomic: true } );

			expect( getAllowedPluginActions( site, 'jetpack' ).isAutoManagedPlugin ).toBe( true );
			expect( getAllowedPluginActions( site, 'vaultpress' ).isAutoManagedPlugin ).toBe( true );
			expect( getAllowedPluginActions( site, 'akismet' ).isAutoManagedPlugin ).toBe( true );
		} );

		test( 'does not flag a regular plugin on Atomic', () => {
			const site = makeSite( { isAtomic: true, managed: true } );

			expect( getAllowedPluginActions( site, 'some-plugin' ).isAutoManagedPlugin ).toBe( false );
		} );

		test( 'does not flag core plugins on a non-Atomic site', () => {
			const site = makeSite( { isAtomic: false, jetpack: true } );

			expect( getAllowedPluginActions( site, 'jetpack' ).isAutoManagedPlugin ).toBe( false );
		} );
	} );
} );
