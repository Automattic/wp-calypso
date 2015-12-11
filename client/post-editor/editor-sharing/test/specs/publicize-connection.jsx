/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	expect = require( 'chai' ).expect;

/**
 * Internal dependencies
 */
var PublicizeConnection = require( '../../publicize-connection' );

/**
 * Module variables
 */
var CONNECTION = {
	ID: 11247568,
	external_ID: '257964634',
	external_display: '@dev_press',
	keyring_connection_ID: 9903589,
	service: 'twitter',
	label: 'Twitter'
};

describe( 'PublicizeConnection', function() {
	beforeEach( function() {
		ReactDom.unmountComponentAtNode( document.body );
	} );

	describe( '#isConnectionSkipped()', function() {
		it( 'should return true if connection is already skipped', function() {
			var post, tree;

			post = {
				metadata: [
					{ id: 1234, key: '_wpas_skip_9903589', value: '1' }
				]
			};

			tree = ReactDom.render(
				<PublicizeConnection
					post={ post }
					connection={ CONNECTION } />,
				document.body
			);

			expect( tree.isConnectionSkipped() ).to.equal( true );
		} );

		it( 'should return false if connection is not skipped', function() {
			var post, tree;

			post = {
				metadata: [
					{ id: 1234, key: '_wpas_skip_1234', value: '1' },
					{ id: 12345, key: '_wpas_done_9903589', value: '1' }
				]
			};

			tree = ReactDom.render(
				<PublicizeConnection
					post={ post }
					connection={ CONNECTION } />,
				document.body
			);

			expect( tree.isConnectionSkipped() ).to.equal( false );
		} );
	} );

	describe( '#isConnectionDone()', function() {
		it( 'should return true if connection is already publicized to', function() {
			var post, tree;

			post = {
				metadata: [
					{ id: 1234, key: '_wpas_done_9903589', value: '1' }
				]
			};

			tree = ReactDom.render(
				<PublicizeConnection
					post={ post }
					connection={ CONNECTION } />,
				document.body
			);

			expect( tree.isConnectionDone() ).to.equal( true );
		} );

		it( 'should return false if connection is not publicized to yet', function() {
			var post, tree;

			post = {
				metadata: [
					{ id: 1234, key: '_wpas_done_1234', value: '1' },
					{ id: 12345, key: '_wpas_skip_9903589', value: '1' }
				]
			};

			tree = ReactDom.render(
				<PublicizeConnection
					post={ post }
					connection={ CONNECTION } />,
				document.body
			);

			expect( tree.isConnectionDone() ).to.equal( false );
		} );
	} );
} );
