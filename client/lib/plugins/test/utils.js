/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import PluginUtils from '../utils';

describe( 'Plugins Utils', () => {
	describe( 'normalizePluginData', () => {
		test( 'should have a method normalizePluginData', () => {
			expect( typeof PluginUtils.normalizePluginData ).toBe( 'function' );
		} );

		test( 'normalizePluginData should normalise the plugin data', () => {
			const plugin = { name: '&lt;a href=&quot;http://google.com&quot;&gt;google&lt;/a&gt;' },
				decodedPlugin = { name: '<a href="http://google.com">google</a>' };
			expect( decodedPlugin ).not.toEqual( PluginUtils.normalizePluginData( plugin ) );
		} );

		test( 'should add the author name to the plugins object', () => {
			const plugin = JSON.parse( '{"author":"<a href=\\"http://jetpack.me\\">Automattic</a>"}' ),
				normalizedPlugin = PluginUtils.normalizePluginData( plugin );
			expect( normalizedPlugin.author_name ).toEqual( 'Automattic' );
		} );

		test( 'should add the author url to the plugins object', () => {
			const plugin = JSON.parse( '{"author":"<a href=\\"http://jetpack.me\\">Automattic</a>"}' ),
				normalizedPlugin = PluginUtils.normalizePluginData( plugin );
			expect( normalizedPlugin.author_url ).toEqual( 'http://jetpack.me' );
		} );

		test( 'should get the best possible icon if available', () => {
			const plugin = { icons: { '1x': '1x test icon', '2x': '2x test icon' } },
				normalizedPlugin = PluginUtils.normalizePluginData( plugin );
			expect( normalizedPlugin.icon ).toEqual( '2x test icon' );
		} );
	} );

	describe( 'whiteListPluginData', () => {
		test( 'should have a method whiteListPluginData', () => {
			expect( typeof PluginUtils.whiteListPluginData ).toBe( 'function' );
		} );

		test( 'should stip out unknown keys', () => {
			const plugin = { unknownKey: true };
			expect( PluginUtils.whiteListPluginData( plugin ) ).toEqual( {} );
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
			expect( PluginUtils.whiteListPluginData( plugin ) ).toEqual( plugin );
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
				),
				extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			expect( Array.isArray( extractedScreenshotData ) ).toBe( true );
			expect( extractedScreenshotData[ 0 ].url ).toEqual( 'http://url-toscreenshot.com/' );
			expect( extractedScreenshotData[ 0 ].caption ).toEqual( 'Caption!' );
		} );

		test( 'should extract the screenshot data from the .org api response with removed items', () => {
			const screenshotData = JSON.parse(
					'{"screenshots":"<ul><li><a href=\\"http://jetpack.me\\"><img /></a><p>Caption!</p></li><li><a href=\\"http://jetpack.me\\"><img src=\\"http://url-toscreenshot.com\\" /></a><p>Caption!</p></li></ul>"}'
				),
				extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			expect( Array.isArray( extractedScreenshotData ) ).toBe( true );
			expect( extractedScreenshotData[ 0 ].url ).toEqual( 'http://url-toscreenshot.com/' );
			expect( extractedScreenshotData[ 0 ].caption ).toEqual( 'Caption!' );
		} );

		test( 'should extract the screenshot data from the .org api response but if no screenshots urls then return null', () => {
			const screenshotData = JSON.parse(
					'{"screenshots":"<ul><li><a href=\\"http://jetpack.me\\"><img /></a><p>Caption!</p></li></ul>"}'
				),
				extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			expect( extractedScreenshotData ).toBeNull();
		} );

		test( 'should return null if screenshots is empty string', () => {
			const screenshotData = JSON.parse( '{"screenshots":""}' ),
				extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
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
				},
				orderedCompatibility = PluginUtils.normalizeCompatibilityList( compatibility );
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
					site: { ID: '123' },
					plugin: { slug: 'jetpack' },
				},
				{
					status: 'status',
					action: 'action',
					site: { ID: '321' },
					plugin: {},
				},
			];
		} );

		test( 'should return a list of notices that match the site', () => {
			logs[ 0 ].plugin = {};
			const log = PluginUtils.filterNotices( logs, { ID: '123' }, null );
			expect( log ).toEqual( [ logs[ 0 ] ] );
		} );

		test( 'should return a list of notices that match a plugin', () => {
			const log = PluginUtils.filterNotices( logs, null, 'jetpack' );
			expect( log ).toEqual( [ logs[ 0 ] ] );
		} );

		test( 'should return a list of notices that match the site and plugin', () => {
			const log = PluginUtils.filterNotices( logs, { ID: '123' }, 'jetpack' );
			expect( log ).toEqual( [ logs[ 0 ] ] );
		} );
	} );
} );
