import { getPluginInstallationPage, getMigrateGuruPageURL } from '../utils';

describe( 'utils', () => {
	describe( 'getPluginInstallationPage', () => {
		it( 'should return WordPress.org plugin page if fromUrl is empty', () => {
			expect( getPluginInstallationPage( '' ) ).toBe(
				'https://wordpress.org/plugins/migrate-guru/'
			);
		} );

		it( 'should return correct plugin installation page for given URL', () => {
			expect( getPluginInstallationPage( 'example.com' ) ).toBe(
				'https://example.com/wp-admin/plugin-install.php?s=%2522migrate%2520guru%2522&tab=search&type=term'
			);
		} );

		it( 'should handle URLs with existing protocol', () => {
			expect( getPluginInstallationPage( 'http://example.com' ) ).toBe(
				'http://example.com/wp-admin/plugin-install.php?s=%2522migrate%2520guru%2522&tab=search&type=term'
			);
		} );

		it( 'should remove duplicate slashes from the URL', () => {
			expect( getPluginInstallationPage( 'https://example.com///' ) ).toBe(
				'https://example.com/wp-admin/plugin-install.php?s=%2522migrate%2520guru%2522&tab=search&type=term'
			);
		} );
	} );

	describe( 'getMigrateGuruPageURL', () => {
		it( 'should return correct Migrate Guru page URL', () => {
			expect( getMigrateGuruPageURL( 'example.com' ) ).toBe(
				'https://example.com/wp-admin/admin.php?page=migrateguru'
			);
		} );

		it( 'should handle URLs with existing protocol', () => {
			expect( getMigrateGuruPageURL( 'http://example.com' ) ).toBe(
				'http://example.com/wp-admin/admin.php?page=migrateguru'
			);
		} );

		it( 'should remove duplicate slashes from the URL', () => {
			expect( getMigrateGuruPageURL( 'https://example.com///' ) ).toBe(
				'https://example.com/wp-admin/admin.php?page=migrateguru'
			);
		} );
	} );
} );
