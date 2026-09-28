/**
 * @jest-environment jsdom
 */
import { getTurnId, startTurn } from '../turn-id';

describe( 'turn id', () => {
	beforeEach( () => {
		sessionStorage.clear();
	} );

	it( 'is empty before the tab sends anything', () => {
		expect( getTurnId() ).toBe( '' );
	} );

	it( 'starts a new turn on each send and keeps it until the next one', () => {
		sessionStorage.setItem( 'agents-manager-turn-id', 'earlier-turn' );

		expect( startTurn() ).toBe( 'fake-uuid' );
		expect( getTurnId() ).toBe( 'fake-uuid' );
	} );

	it( 'survives a page load in the same tab, so a reply after navigation keeps its turn', () => {
		sessionStorage.setItem( 'agents-manager-turn-id', 'turn-before-navigation' );

		expect( getTurnId() ).toBe( 'turn-before-navigation' );
	} );

	it( 'still names the turn for this page load when storage throws', () => {
		const setItem = jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new Error( 'blocked' );
		} );
		const getItem = jest.spyOn( Storage.prototype, 'getItem' ).mockImplementation( () => {
			throw new Error( 'blocked' );
		} );

		startTurn();

		expect( getTurnId() ).toBe( 'fake-uuid' );
		setItem.mockRestore();
		getItem.mockRestore();
	} );
} );
