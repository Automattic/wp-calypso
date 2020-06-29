/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { CONVERT_TO_BLOCKS_DIALOG_DISMISS } from 'state/action-types';
import convertToBlocksDialog from '../reducer';

describe( 'reducer', () => {
	test( 'should add a new site ID key with a new post ID value', () => {
		const state = convertToBlocksDialog( deepFreeze( {} ), {
			type: CONVERT_TO_BLOCKS_DIALOG_DISMISS,
			siteId: 12345678,
			postId: 1,
		} );

		expect( state ).toEqual( {
			12345678: {
				1: 'dismissed',
			},
		} );
	} );

	test( 'should add a new post ID value in the same site ID key', () => {
		const original = deepFreeze( {
			12345678: {
				1: 'dismissed',
			},
		} );
		const state = convertToBlocksDialog( original, {
			type: CONVERT_TO_BLOCKS_DIALOG_DISMISS,
			siteId: 12345678,
			postId: 2,
		} );

		expect( state ).toEqual( {
			12345678: {
				1: 'dismissed',
				2: 'dismissed',
			},
		} );
	} );

	test( 'should add another site ID key with another post ID value', () => {
		const original = deepFreeze( {
			12345678: {
				1: 'dismissed',
				2: 'dismissed',
			},
		} );
		const state = convertToBlocksDialog( original, {
			type: CONVERT_TO_BLOCKS_DIALOG_DISMISS,
			siteId: 87654321,
			postId: 1,
		} );

		expect( state ).toEqual( {
			12345678: {
				1: 'dismissed',
				2: 'dismissed',
			},
			87654321: {
				1: 'dismissed',
			},
		} );
	} );
} );
