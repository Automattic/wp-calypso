import { isSplitScreen } from '../reducer';
import { getIsSplitScreen } from '../selectors';
import type { State } from '../reducer';

const setSplit = ( isSplit: boolean ) =>
	( { type: 'AGENTS_MANAGER_SET_SPLIT_SCREEN', isSplitScreen: isSplit } ) as const;

describe( 'isSplitScreen reducer slice', () => {
	it( 'defaults to false', () => {
		expect( isSplitScreen( undefined, { type: '@@INIT' } as never ) ).toBe( false );
	} );

	it( 'returns the action value on AGENTS_MANAGER_SET_SPLIT_SCREEN', () => {
		expect( isSplitScreen( false, setSplit( true ) ) ).toBe( true );
		expect( isSplitScreen( true, setSplit( false ) ) ).toBe( false );
	} );

	it( 'leaves state untouched on unrelated actions', () => {
		expect(
			isSplitScreen( true, { type: 'AGENTS_MANAGER_SET_OPEN', isOpen: false } as never )
		).toBe( true );
	} );

	it( 'resets to false when the sidebar is undocked', () => {
		const undock = { type: 'AGENTS_MANAGER_SET_DOCKED', isDocked: false } as never;
		expect( isSplitScreen( true, undock ) ).toBe( false );
	} );

	it( 'preserves state when the sidebar is (re-)docked', () => {
		const dock = { type: 'AGENTS_MANAGER_SET_DOCKED', isDocked: true } as never;
		expect( isSplitScreen( true, dock ) ).toBe( true );
		expect( isSplitScreen( false, dock ) ).toBe( false );
	} );
} );

describe( 'getIsSplitScreen selector', () => {
	it( 'returns the slice value', () => {
		const state = { isSplitScreen: true } as State;
		expect( getIsSplitScreen( state ) ).toBe( true );
		expect( getIsSplitScreen( { isSplitScreen: false } as State ) ).toBe( false );
	} );
} );
