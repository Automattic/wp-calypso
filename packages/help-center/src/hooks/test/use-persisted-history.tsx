/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import { usePersistedHistory } from '../use-persisted-history';

const mockUseSelect = jest.fn();
const mockIsGetHelpChatForward = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( mapSelect: ( select: unknown ) => unknown ) => mockUseSelect( mapSelect ),
	dispatch: () => ( { setHelpCenterRouterHistory: jest.fn() } ),
} ) );

jest.mock( '../use-get-help-chat-forward', () => ( {
	useIsGetHelpChatForward: () => mockIsGetHelpChatForward(),
} ) );

const entry = ( pathname: string ) => ( {
	pathname,
	search: '',
	hash: '',
	key: pathname,
	state: null,
} );

const setup = ( {
	isGetHelpChatForward = false,
	persistedHistory = null as { entries: ReturnType< typeof entry >[]; index: number } | null,
	navigateToRoute = undefined as { route: string } | undefined,
} = {} ) => {
	mockIsGetHelpChatForward.mockReturnValue( isGetHelpChatForward );
	mockUseSelect.mockReturnValue( { persistedHistory, navigateToRoute } );
	return renderHook( () => usePersistedHistory() );
};

describe( 'usePersistedHistory', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'starts at the root route by default', () => {
		const { result } = setup();

		expect( result.current.state.location.pathname ).toBe( '/' );
	} );

	it( 'restores the persisted location', () => {
		const { result } = setup( {
			persistedHistory: { entries: [ entry( '/' ), entry( '/post' ) ], index: 1 },
		} );

		expect( result.current.state.location.pathname ).toBe( '/post' );
	} );

	it( 'lands on the AI chat in the chat-forward treatment', () => {
		const { result } = setup( { isGetHelpChatForward: true } );

		expect( result.current.state.location.pathname ).toBe( '/odie' );
	} );

	it( 'drops the persisted location in the chat-forward treatment', () => {
		const { result } = setup( {
			isGetHelpChatForward: true,
			persistedHistory: { entries: [ entry( '/' ), entry( '/post' ) ], index: 1 },
		} );

		expect( result.current.state.location.pathname ).toBe( '/odie' );
	} );

	it( 'keeps search one step back in the chat-forward treatment', () => {
		const { result } = setup( { isGetHelpChatForward: true } );

		act( () => result.current.history.goBack() );

		expect( result.current.history.location.pathname ).toBe( '/' );
	} );

	it( 'leaves a requested route to the pending navigation', () => {
		const { result } = setup( {
			isGetHelpChatForward: true,
			navigateToRoute: { route: '/post/?link=example' },
		} );

		expect( result.current.state.location.pathname ).toBe( '/' );
	} );
} );
