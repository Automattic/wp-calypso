/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getSiteEditor } from '../selectors';

describe( 'selectors', () => {
	const createStateWithItems = items =>
		deepFreeze( {
			sites: { items },
		} );

	const siteId = 77203074;
	const nonExistingSiteId = 123;
	const stateWithNoItems = createStateWithItems( {} );

	describe( 'getSiteEditor()', () => {
		test( 'should return null if site is not found', () => {
			expect( getSiteEditor( stateWithNoItems, nonExistingSiteId ) ).toBeNull();
		} );

		test( 'should return null if a valid site has no editor set', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
				},
			} );
			expect( getSiteEditor( state, siteId ) ).toBeNull();
		} );

		test( 'should return editor value for a valid site with an editor set', () => {
			const state = createStateWithItems( {
				[ siteId ]: {
					ID: siteId,
					editor: 'gutenberg',
				},
			} );
			expect( getSiteEditor( state, siteId ) ).toBe( 'gutenberg' );
		} );
	} );
} );
