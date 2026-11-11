/**
 * @jest-environment jsdom
 */
import { getTabId } from '../tab-id';

describe( 'getTabId', () => {
	beforeEach( () => {
		sessionStorage.clear();
	} );

	it( 'returns the same id for the whole tab', () => {
		const first = getTabId();

		expect( first ).toBe( 'fake-uuid' );
		expect( getTabId() ).toBe( first );
		expect( sessionStorage.getItem( 'agents-manager-tab-id' ) ).toBe( first );
	} );

	it( 'reuses the id another page load stored in this tab', () => {
		sessionStorage.setItem( 'agents-manager-tab-id', 'earlier-tab' );

		expect( getTabId() ).toBe( 'earlier-tab' );
	} );

	it( 'still returns one id per page load when storage throws', () => {
		const getItem = jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
			throw new Error( 'blocked' );
		} );

		const first = getTabId();

		expect( first ).toBe( 'fake-uuid' );
		expect( getTabId() ).toBe( first );
		getItem.mockRestore();
	} );
} );
