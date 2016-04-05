/**
 * External dependencies
 */
var assert = require( 'chai' ).assert;

require( 'lib/react-test-env-setup' )();

describe( 'Plugins Utils', function() {
	var PluginUtils = require( 'lib/plugins/utils' );

	describe( 'normalizePluginData', function() {
		it( 'should have a method normalizePluginData', function() {
			assert.isFunction( PluginUtils.normalizePluginData );
		} );

		it( 'normalizePluginData should normalise the plugin data', function() {
			var plugin = { name: '&lt;a href=&quot;http://google.com&quot;&gt;google&lt;/a&gt;' },
				decodedPlugin = { name: '<a href="http://google.com">google</a>' };
			assert.notEqual( decodedPlugin, PluginUtils.normalizePluginData( plugin ) );
		} );

		it( 'should add the author name to the plugins object', function() {
			var plugin = JSON.parse( '{"author":"<a href=\\"http:\/\/jetpack.me\\">Automattic<\/a>"}' );
			plugin = PluginUtils.normalizePluginData( plugin );
			assert.equal( plugin.author_name, 'Automattic' );
		} );

		it( 'should add the author url to the plugins object', function() {
			var plugin = JSON.parse( '{"author":"<a href=\\"http:\/\/jetpack.me\\">Automattic<\/a>"}' );
			plugin = PluginUtils.normalizePluginData( plugin );
			assert.equal( plugin.author_url, 'http://jetpack.me' );
		} );

		it( 'should get the best possible icon if available', function() {
			var plugin = { icons: { '1x': '1x test icon', '2x': '2x test icon' } };

			plugin = PluginUtils.normalizePluginData( plugin );
			assert.equal( plugin.icon, '2x test icon' );
		} );
	} );

	describe( 'whiteListPluginData', function() {
		it( 'should have a method whiteListPluginData', function() {
			assert.isFunction( PluginUtils.whiteListPluginData );
		} );

		it( 'should stip out unknown keys', function() {
			var plugin = { unknownKey: true };
			assert.deepEqual( PluginUtils.whiteListPluginData( plugin ), {} );
		} );

		it( 'should keep known keys', function() {
			var plugin = {
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
				updating: false
			};
			assert.deepEqual( PluginUtils.whiteListPluginData( plugin ), plugin );
		} );
	} );

	describe( 'extractAuthorName', function() {
		it( 'should extract the author from the .org api response', function() {
			const jetpackAuthorObj = JSON.parse( '{"author":"<a href=\\"http:\/\/jetpack.me\\">Automattic<\/a>"}' );
			assert.equal( PluginUtils.extractAuthorName( jetpackAuthorObj.author ), 'Automattic' );
		} );

		it( 'should support names with special chars', function() {
			var plugin = JSON.parse( '{"author":"<a href=\\"http:\/\/test.com\/\\">&#209;&#225;&#240;<\/a>"}' );
			assert.equal( PluginUtils.extractAuthorName( plugin.author ), 'Ñáð' );
		} );
	} );

	describe( 'extractScreenshots', function() {
		it( 'should extract the screenshot data from the .org api response', function() {
			let screenshotData = JSON.parse( '{"screenshots":"<ul><li><a href=\\"http:\/\/jetpack.me\\"><img src=\\"http:\/\/url-toscreenshot.com\\" \/><\/a><p>Caption!<\/p><\/li></ul>"}' );
			let extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			assert.isArray( extractedScreenshotData );
			assert.equal( extractedScreenshotData[ 0 ].url, 'http:\/\/url-toscreenshot.com/' );
			assert.equal( extractedScreenshotData[ 0 ].caption, 'Caption!' );
		} );

		it( 'should extract the screenshot data from the .org api response with removed items', function() {
			let screenshotData = JSON.parse( '{"screenshots":"<ul><li><a href=\\"http:\/\/jetpack.me\\"><img \/><\/a><p>Caption!<\/p><\/li><li><a href=\\"http:\/\/jetpack.me\\"><img src=\\"http:\/\/url-toscreenshot.com\\" \/><\/a><p>Caption!<\/p><\/li></ul>"}' );
			let extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			assert.isArray( extractedScreenshotData );
			assert.equal( extractedScreenshotData[ 0 ].url, 'http:\/\/url-toscreenshot.com/' );
			assert.equal( extractedScreenshotData[ 0 ].caption, 'Caption!' );
		} );

		it( 'should extract the screenshot data from the .org api response but if no screenshots urls then return null', function() {
			let screenshotData = JSON.parse( '{"screenshots":"<ul><li><a href=\\"http:\/\/jetpack.me\\"><img \/><\/a><p>Caption!<\/p><\/li></ul>"}' );
			let extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			assert.isNull( extractedScreenshotData );
		} );

		it( 'should return null if screenshots is empty string', function() {
			let screenshotData = JSON.parse( '{"screenshots":""}' );
			let extractedScreenshotData = PluginUtils.extractScreenshots( screenshotData.screenshots );
			assert.isNull( extractedScreenshotData );
		} );

		it( 'should return null if we pass null instead of JSON”', function() {
			let extractedScreenshotData = PluginUtils.extractScreenshots( null );
			assert.isNull( extractedScreenshotData );
		} );
	} );

	describe( 'normalizeCompatibilityList', function() {
		it( 'should trunc the hotfix number if 0', function() {
			var compatibility = { '1.5.0': {} };

			assert.equal( PluginUtils.normalizeCompatibilityList( compatibility )[ 0 ], '1.5' );
		} );

		it( 'should not trunc the minor number if 0', function() {
			var compatibility = { '1.0': {} };

			assert.equal( PluginUtils.normalizeCompatibilityList( compatibility )[ 0 ], '1.0' );
		} );

		it( 'should provide an ordered compatibility list', function() {
			var compatibility, orderedCompatibility;
			compatibility = {
				'1.1.3': {},
				'01.1.4': {},
				10.3: {},
				1.5: {}
			};
			orderedCompatibility = PluginUtils.normalizeCompatibilityList( compatibility );

			assert.equal( orderedCompatibility.length, 4 );
			assert.deepEqual( orderedCompatibility, [ '1.1.3', '1.1.4', '1.5', '10.3' ] );
		} );
	} );

	describe( 'filterNotices', function() {
		it( 'should return a list of notices that match the site', function() {
			var logs = [
					{
						status: 'status',
						action: 'action',
						site: { ID: '123' },
						plugin: {}
					},
					{
						status: 'status',
						action: 'action',
						site: { ID: '321' },
						plugin: {}
					}
				],
				log = PluginUtils.filterNotices( logs, { ID: '123' }, null );

			assert.deepEqual( log, [ logs[ 0 ] ] );
		} );

		it( 'should return a list of notices that match a plugin', function() {
			var logs = [
					{
						status: 'status',
						action: 'action',
						site: { ID: '123' },
						plugin: { slug: 'jetpack' }
					},
					{
						status: 'status',
						action: 'action',
						site: { ID: '321' },
						plugin: {}
					}
				],
				log = PluginUtils.filterNotices( logs, null, 'jetpack' );

			assert.deepEqual( log, [ logs[ 0 ] ] );
		} );

		it( 'should return a list of notices that match the site and plugin', function() {
			var logs = [
					{
						status: 'status',
						action: 'action',
						site: { ID: '123' },
						plugin: { slug: 'jetpack' }
					},
					{
						status: 'status',
						action: 'action',
						site: { ID: '321' },
						plugin: {}
					}
				],
				log = PluginUtils.filterNotices( logs, { ID: '123' }, 'jetpack' );

			assert.deepEqual( log, [ logs[ 0 ] ] );
		} );
	} );
} );
