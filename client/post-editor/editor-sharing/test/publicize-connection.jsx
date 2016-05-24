/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';

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
	let PublicizeConnection;

	useFakeDom();

	before( () => {
		PublicizeConnection = require( '../publicize-connection' );
	} );

	describe( '#isConnectionSkipped()', function() {
		it( 'should return true if connection is already skipped', function() {
			var post, tree;

			post = {
				metadata: [
					{ id: 1234, key: '_wpas_skip_9903589', value: '1' }
				]
			};

			tree = shallow(
				<PublicizeConnection
					post={ post }
					connection={ CONNECTION } />
			).instance();

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

			tree = shallow(
				<PublicizeConnection
					post={ post }
					connection={ CONNECTION } />
			).instance();

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

			tree = shallow(
				<PublicizeConnection
					post={ post }
					connection={ CONNECTION } />
			).instance();

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

			tree = shallow(
				<PublicizeConnection
					post={ post }
					connection={ CONNECTION } />
			).instance();

			expect( tree.isConnectionDone() ).to.equal( false );
		} );
	} );
} );
