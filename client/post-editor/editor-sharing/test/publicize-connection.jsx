/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { EditorSharingPublicizeConnection as PublicizeConnection } from '../publicize-connection';

/**
 * Module variables
 */
const CONNECTION = {
	ID: 11247568,
	external_ID: '257964634',
	external_display: '@dev_press',
	keyring_connection_ID: 9903589,
	service: 'twitter',
	label: 'Twitter',
};

describe( 'PublicizeConnection', () => {
	describe( '#isConnectionSkipped()', () => {
		test( 'should return true if connection is already skipped', () => {
			let post, tree;

			post = {
				metadata: [ { id: 1234, key: '_wpas_skip_9903589', value: '1' } ],
			};

			tree = shallow( <PublicizeConnection post={ post } connection={ CONNECTION } /> ).instance();

			expect( tree.isConnectionSkipped() ).to.equal( true );
		} );

		test( 'should return false if connection is not skipped', () => {
			let post, tree;

			post = {
				metadata: [
					{ id: 1234, key: '_wpas_skip_1234', value: '1' },
					{ id: 12345, key: '_wpas_done_9903589', value: '1' },
				],
			};

			tree = shallow( <PublicizeConnection post={ post } connection={ CONNECTION } /> ).instance();

			expect( tree.isConnectionSkipped() ).to.equal( false );
		} );
	} );

	describe( '#isConnectionDone()', () => {
		test( 'should return true if connection is already publicized to', () => {
			let post, tree;

			post = {
				metadata: [ { id: 1234, key: '_wpas_done_9903589', value: '1' } ],
			};

			tree = shallow( <PublicizeConnection post={ post } connection={ CONNECTION } /> ).instance();

			expect( tree.isConnectionDone() ).to.equal( true );
		} );

		test( 'should return false if connection is not publicized to yet', () => {
			let post, tree;

			post = {
				metadata: [
					{ id: 1234, key: '_wpas_done_1234', value: '1' },
					{ id: 12345, key: '_wpas_skip_9903589', value: '1' },
				],
			};

			tree = shallow( <PublicizeConnection post={ post } connection={ CONNECTION } /> ).instance();

			expect( tree.isConnectionDone() ).to.equal( false );
		} );
	} );
} );
