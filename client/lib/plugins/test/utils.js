/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import * as PluginUtils from '../utils';

describe( 'Plugins Utils', () => {
	describe( 'normalizePluginData', () => {
		test( 'should have a method normalizePluginData', () => {
			assert.isFunction( PluginUtils.normalizePluginData );
		} );

		test( 'normalizePluginData should normalise the plugin data', () => {
			const plugin = { name: '&lt;a href=&quot;http://google.com&quot;&gt;google&lt;/a&gt;' };
			const decodedPlugin = { name: '<a href="http://google.com">google</a>' };
			assert.notEqual( decodedPlugin, PluginUtils.normalizePluginData( plugin ) );
		} );

		test( 'should add the author name to the plugins object', () => {
			const plugin = JSON.parse( '{"author":"<a href=\\"http://jetpack.me\\">Automattic</a>"}' );
			const normalizedPlugin = PluginUtils.normalizePluginData( plugin );
			assert.equal( normalizedPlugin.author_name, 'Automattic' );
		} );

		test( 'should add the author url to the plugins object', () => {
			const plugin = JSON.parse( '{"author":"<a href=\\"http://jetpack.me\\">Automattic</a>"}' );
			const normalizedPlugin = PluginUtils.normalizePluginData( plugin );
			assert.equal( normalizedPlugin.author_url, 'http://jetpack.me' );
		} );

		test( 'should get the best possible icon if available', () => {
			const plugin = { icons: { '1x': '1x test icon', '2x': '2x test icon' } };
			const normalizedPlugin = PluginUtils.normalizePluginData( plugin );
			assert.equal( normalizedPlugin.icon, '2x test icon' );
		} );
	} );

	describe( 'getAllowedPluginData', () => {
		test( 'should have a method getAllowedPluginData', () => {
			assert.isFunction( PluginUtils.getAllowedPluginData );
		} );

		test( 'should stip out unknown keys', () => {
			const plugin = { unknownKey: true };
			assert.deepEqual( PluginUtils.getAllowedPluginData( plugin ), {} );
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
			assert.deepEqual( PluginUtils.getAllowedPluginData( plugin ), plugin );
		} );
	} );

	describe( 'extractAuthorName', () => {
		test( 'should extract the author from the .org api response', () => {
			const jetpackAuthorObj = JSON.parse(
				'{"author":"<a href=\\"http://jetpack.me\\">Automattic</a>"}'
			);
			assert.equal( PluginUtils.extractAuthorName( jetpackAuthorObj.author ), 'Automattic' );
		} );

		test( 'should support names with special chars', () => {
			const plugin = JSON.parse(
				'{"author":"<a href=\\"http://test.com/\\">&#209;&#225;&#240;</a>"}'
			);
			assert.equal( PluginUtils.extractAuthorName( plugin.author ), 'Ñáð' );
		} );
	} );

	describe( 'extractScreenshots', () => {
		test( 'should extract the screenshot data from the .org api response', () => {
			const screenshotData = JSON.parse(
				'{"screenshots":"<ul><li><a href=\\"http://jetpack.me\\"><img src=\\"http://url-toscreenshot.com\\" /></a><p>Caption!</p></li></ul>"}'
			);
			const extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			assert.isArray( extractedScreenshotData );
			assert.equal( extractedScreenshotData[ 0 ].url, 'http://url-toscreenshot.com/' );
			assert.equal( extractedScreenshotData[ 0 ].caption, 'Caption!' );
		} );

		test( 'should extract the screenshot data from the .org api response with removed items', () => {
			const screenshotData = JSON.parse(
				'{"screenshots":"<ul><li><a href=\\"http://jetpack.me\\"><img /></a><p>Caption!</p></li><li><a href=\\"http://jetpack.me\\"><img src=\\"http://url-toscreenshot.com\\" /></a><p>Caption!</p></li></ul>"}'
			);
			const extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			assert.isArray( extractedScreenshotData );
			assert.equal( extractedScreenshotData[ 0 ].url, 'http://url-toscreenshot.com/' );
			assert.equal( extractedScreenshotData[ 0 ].caption, 'Caption!' );
		} );

		test( 'should extract the screenshot data from the .org api response but if no screenshots urls then return null', () => {
			const screenshotData = JSON.parse(
				'{"screenshots":"<ul><li><a href=\\"http://jetpack.me\\"><img /></a><p>Caption!</p></li></ul>"}'
			);
			const extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			assert.isNull( extractedScreenshotData );
		} );

		test( 'should return null if screenshots is empty string', () => {
			const screenshotData = JSON.parse( '{"screenshots":""}' );
			const extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			assert.isNull( extractedScreenshotData );
		} );

		test( 'should return null if we pass null instead of JSON”', () => {
			const extractedScreenshotData = PluginUtils.extractScreenshots( null );
			assert.isNull( extractedScreenshotData );
		} );
	} );

	describe( 'normalizeCompatibilityList', () => {
		test( 'should trunc the hotfix number if 0', () => {
			const compatibility = { '1.5.0': {} };
			assert.equal( PluginUtils.normalizeCompatibilityList( compatibility )[ 0 ], '1.5' );
		} );

		test( 'should not trunc the minor number if 0', () => {
			const compatibility = { '1.0': {} };
			assert.equal( PluginUtils.normalizeCompatibilityList( compatibility )[ 0 ], '1.0' );
		} );

		test( 'should provide an ordered compatibility list', () => {
			const compatibility = {
				'1.1.3': {},
				'01.1.4': {},
				10.3: {},
				1.5: {},
			};
			const orderedCompatibility = PluginUtils.normalizeCompatibilityList( compatibility );
			assert.equal( orderedCompatibility.length, 4 );
			assert.deepEqual( orderedCompatibility, [ '1.1.3', '1.1.4', '1.5', '10.3' ] );
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
			assert.deepEqual( log, [ logs[ 0 ] ] );
		} );

		test( 'should return a list of notices that match a plugin', () => {
			const log = PluginUtils.filterNotices( logs, null, 'jetpack' );
			assert.deepEqual( log, [ logs[ 0 ] ] );
		} );

		test( 'should return a list of notices that match the site and plugin', () => {
			const log = PluginUtils.filterNotices( logs, 123, 'jetpack' );
			assert.deepEqual( log, [ logs[ 0 ] ] );
		} );
	} );
} );
