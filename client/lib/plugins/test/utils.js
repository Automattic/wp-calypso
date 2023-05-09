/**
 * @jest-environment jsdom
 */

import * as PluginUtils from '../utils';

describe( 'Plugins Utils', () => {
	describe( 'normalizePluginData', () => {
		test( 'normalizePluginData should normalise the plugin data', () => {
			const plugin = { name: '&lt;a href=&quot;http://google.com&quot;&gt;google&lt;/a&gt;' };
			const decodedPlugin = { name: '<a href="http://google.com">google</a>' };
			expect( decodedPlugin ).toEqual( PluginUtils.normalizePluginData( plugin ) );
		} );

		test( 'should add the author name to the plugins object', () => {
			const plugin = JSON.parse( '{"author":"<a href=\\"http://jetpack.me\\">Automattic</a>"}' );
			const normalizedPlugin = PluginUtils.normalizePluginData( plugin );
			expect( normalizedPlugin.author_name ).toEqual( 'Automattic' );
		} );

		test( 'should add the author url to the plugins object', () => {
			const plugin = JSON.parse( '{"author":"<a href=\\"http://jetpack.me\\">Automattic</a>"}' );
			const normalizedPlugin = PluginUtils.normalizePluginData( plugin );
			expect( normalizedPlugin.author_url ).toEqual( 'http://jetpack.me' );
		} );

		test( 'should get the best possible icon if available', () => {
			const plugin = { icons: { '1x': '1x test icon', '2x': '2x test icon' } };
			const normalizedPlugin = PluginUtils.normalizePluginData( plugin );
			expect( normalizedPlugin.icon ).toEqual( '2x test icon' );
		} );
	} );

	describe( 'getAllowedPluginData', () => {
		test( 'should have a method getAllowedPluginData', () => {
			expect( typeof PluginUtils.getAllowedPluginData ).toBe( 'function' );
		} );

		test( 'should stip out unknown keys', () => {
			const plugin = { unknownKey: true };
			expect( PluginUtils.getAllowedPluginData( plugin ) ).toEqual( {} );
		} );

		test( 'should keep known keys', () => {
			const plugin = {
				active: false,
				author: 'Automattic',
				author_url: 'http://automattic.com',
				autoupdate: false,
				description: 'The first stop for every WordPress developer',
				id: 'developer/developer',
				name: 'Developer',
				network: false,
				plugin_url: 'http://wordpress.org/extend/plugins/developer/',
				slug: 'developer',
				version: '1.2.5',
				update: {},
				updating: false,
			};
			expect( PluginUtils.getAllowedPluginData( plugin ) ).toEqual( plugin );
		} );
	} );

	describe( 'extractAuthorName', () => {
		test( 'should extract the author from the .org api response', () => {
			const jetpackAuthorObj = JSON.parse(
				'{"author":"<a href=\\"http://jetpack.me\\">Automattic</a>"}'
			);
			expect( PluginUtils.extractAuthorName( jetpackAuthorObj.author ) ).toEqual( 'Automattic' );
		} );

		test( 'should support names with special chars', () => {
			const plugin = JSON.parse(
				'{"author":"<a href=\\"http://test.com/\\">&#209;&#225;&#240;</a>"}'
			);
			expect( PluginUtils.extractAuthorName( plugin.author ) ).toEqual( 'Ñáð' );
		} );
	} );

	describe( 'extractScreenshots', () => {
		test( 'should extract the screenshot data from the .org api response', () => {
			const screenshotData = JSON.parse(
				'{"screenshots":"<ul><li><a href=\\"http://jetpack.me\\"><img src=\\"http://url-toscreenshot.com\\" /></a><p>Caption!</p></li></ul>"}'
			);
			const extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			expect( Array.isArray( extractedScreenshotData ) ).toBe( true );
			expect( extractedScreenshotData[ 0 ].url ).toEqual( 'http://url-toscreenshot.com/' );
			expect( extractedScreenshotData[ 0 ].caption ).toEqual( 'Caption!' );
		} );

		test( 'should extract the screenshot data from the .org api response with removed items', () => {
			const screenshotData = JSON.parse(
				'{"screenshots":"<ul><li><a href=\\"http://jetpack.me\\"><img /></a><p>Caption!</p></li><li><a href=\\"http://jetpack.me\\"><img src=\\"http://url-toscreenshot.com\\" /></a><p>Caption!</p></li></ul>"}'
			);
			const extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			expect( Array.isArray( extractedScreenshotData ) ).toBe( true );
			expect( extractedScreenshotData[ 0 ].url ).toEqual( 'http://url-toscreenshot.com/' );
			expect( extractedScreenshotData[ 0 ].caption ).toEqual( 'Caption!' );
		} );

		test( 'should extract the screenshot data from the .org api response but if no screenshots urls then return null', () => {
			const screenshotData = JSON.parse(
				'{"screenshots":"<ul><li><a href=\\"http://jetpack.me\\"><img /></a><p>Caption!</p></li></ul>"}'
			);
			const extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			expect( extractedScreenshotData ).toBeNull();
		} );

		test( 'should return null if screenshots is empty string', () => {
			const screenshotData = JSON.parse( '{"screenshots":""}' );
			const extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			expect( extractedScreenshotData ).toBeNull();
		} );

		test( 'should return null if we pass null instead of JSON”', () => {
			const extractedScreenshotData = PluginUtils.extractScreenshots( null );
			expect( extractedScreenshotData ).toBeNull();
		} );
	} );

	describe( 'normalizeCompatibilityList', () => {
		test( 'should trunc the hotfix number if 0', () => {
			const compatibility = { '1.5.0': {} };
			expect( PluginUtils.normalizeCompatibilityList( compatibility )[ 0 ] ).toEqual( '1.5' );
		} );

		test( 'should not trunc the minor number if 0', () => {
			const compatibility = { '1.0': {} };
			expect( PluginUtils.normalizeCompatibilityList( compatibility )[ 0 ] ).toEqual( '1.0' );
		} );

		test( 'should provide an ordered compatibility list', () => {
			const compatibility = {
				'1.1.3': {},
				'01.1.4': {},
				10.3: {},
				1.5: {},
			};
			const orderedCompatibility = PluginUtils.normalizeCompatibilityList( compatibility );
			expect( orderedCompatibility.length ).toEqual( 4 );
			expect( orderedCompatibility ).toEqual( [ '1.1.3', '1.1.4', '1.5', '10.3' ] );
		} );
	} );

	describe( 'filterNotices', () => {
		let logs;

		beforeEach( () => {
			logs = [
				{
					status: 'status',
					action: 'action',
					siteId: 123,
					pluginId: 'jetpack',
				},
				{
					status: 'status',
					action: 'action',
					siteId: 321,
				},
			];
		} );

		test( 'should return a list of notices that match the site', () => {
			logs[ 0 ].pluginId = undefined;
			const log = PluginUtils.filterNotices( logs, 123, null );
			expect( log ).toEqual( [ logs[ 0 ] ] );
		} );

		test( 'should return a list of notices that match a plugin', () => {
			const log = PluginUtils.filterNotices( logs, null, 'jetpack' );
			expect( log ).toEqual( [ logs[ 0 ] ] );
		} );

		test( 'should return a list of notices that match the site and plugin', () => {
			const log = PluginUtils.filterNotices( logs, 123, 'jetpack' );
			expect( log ).toEqual( [ logs[ 0 ] ] );
		} );
	} );

	describe( 'isSamePluginIdSlug', () => {
		test( 'should return false for ID and slug', () => {
			expect( PluginUtils.isSamePluginIdSlug( 1, 'slug' ) ).toEqual( false );
			expect( PluginUtils.isSamePluginIdSlug( 'slug', 1 ) ).toEqual( false );
		} );

		test( 'should return false for non-matching slugs', () => {
			expect( PluginUtils.isSamePluginIdSlug( 'slug1', 'slug2' ) ).toEqual( false );
			expect( PluginUtils.isSamePluginIdSlug( 'slug2', 'slug1' ) ).toEqual( false );
		} );

		test( 'should return false for non-matching ids', () => {
			expect( PluginUtils.isSamePluginIdSlug( 1, 2 ) ).toEqual( false );
			expect( PluginUtils.isSamePluginIdSlug( 2, 1 ) ).toEqual( false );
		} );

		test( 'should return true for number and string', () => {
			expect( PluginUtils.isSamePluginIdSlug( 1, '1' ) ).toEqual( true );
			expect( PluginUtils.isSamePluginIdSlug( '1', 1 ) ).toEqual( true );
		} );

		test( 'should return true for match before/after slash', () => {
			expect( PluginUtils.isSamePluginIdSlug( 'vendor/plugin', 'plugin' ) ).toEqual( true );
			expect( PluginUtils.isSamePluginIdSlug( 'plugin', 'vendor/plugin' ) ).toEqual( true );

			expect( PluginUtils.isSamePluginIdSlug( 'vendor/plugin', 'vendor' ) ).toEqual( true );
			expect( PluginUtils.isSamePluginIdSlug( 'vendor', 'vendor/plugin' ) ).toEqual( true );
		} );
	} );
} );
