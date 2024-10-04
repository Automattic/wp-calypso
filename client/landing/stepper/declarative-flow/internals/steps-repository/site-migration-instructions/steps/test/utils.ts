import { getMigrationPluginInstallURL, getMigrationPluginPageURL } from '../utils';

describe( 'utils', () => {
	describe( 'getMigrationPluginInstallURL', () => {
		it( 'should return WordPress.org plugin page if fromUrl is empty', () => {
			expect( getMigrationPluginInstallURL( '' ) ).toBe(
				'https://wordpress.org/plugins/wpcom-migration/'
			);
		} );

		it( 'should return correct plugin installation page for given URL', () => {
			expect( getMigrationPluginInstallURL( 'example.com' ) ).toBe(
				'https://example.com/wp-admin/plugin-install.php?s=%2522wpcom%2520migration%2522&tab=search&type=term'
			);
		} );

		it( 'should handle URLs with existing protocol', () => {
			expect( getMigrationPluginInstallURL( 'http://example.com' ) ).toBe(
				'http://example.com/wp-admin/plugin-install.php?s=%2522wpcom%2520migration%2522&tab=search&type=term'
			);
		} );

		it( 'should remove duplicate slashes from the URL', () => {
			expect( getMigrationPluginInstallURL( 'https://example.com///' ) ).toBe(
				'https://example.com/wp-admin/plugin-install.php?s=%2522wpcom%2520migration%2522&tab=search&type=term'
			);
		} );
	} );

	describe( 'getMigrationPluginPageURL', () => {
		it( 'should return correct page URL', () => {
			expect( getMigrationPluginPageURL( 'example.com' ) ).toBe(
				'https://example.com/wp-admin/admin.php?page=wpcom-migration'
			);
		} );

		it( 'should handle URLs with existing protocol', () => {
			expect( getMigrationPluginPageURL( 'http://example.com' ) ).toBe(
				'http://example.com/wp-admin/admin.php?page=wpcom-migration'
			);
		} );

		it( 'should remove duplicate slashes from the URL', () => {
			expect( getMigrationPluginPageURL( 'https://example.com///' ) ).toBe(
				'https://example.com/wp-admin/admin.php?page=wpcom-migration'
			);
		} );
	} );
} );
