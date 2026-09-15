/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'automattic/agents-manager' } ) );
jest.mock( '../../contexts', () => ( { useAgentsManagerContext: jest.fn() } ) );
jest.mock( '../../utils/uses-local-state-persistence', () => ( {
	usesLocalStatePersistence: jest.fn(),
} ) );
jest.mock( '../../utils/get-agents-manager-inline-data', () => ( {
	getAgentsManagerInlineData: jest.fn(),
} ) );
jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn(),
	useSelect: jest.fn(),
} ) );

import { renderHook } from '@testing-library/react';
import { useDispatch, useSelect } from '@wordpress/data';
import { useAgentsManagerContext } from '../../contexts';
import { getAgentsManagerInlineData } from '../../utils/get-agents-manager-inline-data';
import { usesLocalStatePersistence } from '../../utils/uses-local-state-persistence';
import useReaderChatPersistence from '../use-reader-chat-persistence';

const mockUseDispatch = useDispatch as jest.Mock;
const mockUseSelect = useSelect as jest.Mock;
const mockUseContext = useAgentsManagerContext as jest.Mock;
const mockInlineData = getAgentsManagerInlineData as jest.Mock;
const mockUsesLocalStatePersistence = usesLocalStatePersistence as jest.Mock;

const setIsOpen = jest.fn();

const SHOPPER = 'woo-shopper-assistant';
const KEY = `jetpack-reader-chat-open-${ SHOPPER }`;

const render = ( { agentId, isOpen = false }: { agentId?: string; isOpen?: boolean } ) => {
	mockUseContext.mockReturnValue( { agentConfig: agentId ? { agentId } : undefined } );
	mockUseSelect.mockImplementation( () => isOpen );
	return renderHook( () => useReaderChatPersistence() );
};

describe( 'useReaderChatPersistence', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		sessionStorage.clear();
		mockUseDispatch.mockReturnValue( { setIsOpen } );
		mockUsesLocalStatePersistence.mockReturnValue( true );
		mockInlineData.mockReturnValue( undefined );
	} );

	it( 'restores the open state for a client-persisted host', () => {
		sessionStorage.setItem( KEY, '1' );

		render( { agentId: SHOPPER } );

		expect( setIsOpen ).toHaveBeenCalledWith( true, false );
	} );

	it( 'restores once the agent id arrives, not only on mount', () => {
		sessionStorage.setItem( KEY, '1' );

		// First render has no agentConfig — the storefront loads its provider
		// asynchronously. This is the case that used to lose the flag.
		const { rerender } = render( { agentId: undefined } );
		expect( setIsOpen ).not.toHaveBeenCalled();

		mockUseContext.mockReturnValue( { agentConfig: { agentId: SHOPPER } } );
		rerender();

		expect( setIsOpen ).toHaveBeenCalledWith( true, false );
	} );

	it( 'falls back to the inline payload when the context id is not ready', () => {
		sessionStorage.setItem( KEY, '1' );
		mockInlineData.mockReturnValue( { agentId: SHOPPER } );

		render( { agentId: undefined } );

		expect( setIsOpen ).toHaveBeenCalledWith( true, false );
	} );

	it( 'does not clear the stored flag before the restore has run', () => {
		sessionStorage.setItem( KEY, '1' );

		// isOpen is false on the first render; the write must not fire yet.
		render( { agentId: undefined } );

		expect( sessionStorage.getItem( KEY ) ).toBe( '1' );
	} );

	it( 'writes the flag when the chat is open', () => {
		render( { agentId: SHOPPER, isOpen: true } );

		expect( sessionStorage.getItem( KEY ) ).toBe( '1' );
	} );

	it( 'removes the flag when the chat is closed again', () => {
		sessionStorage.setItem( KEY, '1' );

		const { rerender } = render( { agentId: SHOPPER, isOpen: true } );
		expect( sessionStorage.getItem( KEY ) ).toBe( '1' );

		mockUseSelect.mockImplementation( () => false );
		rerender();

		expect( sessionStorage.getItem( KEY ) ).toBeNull();
	} );

	it( 'is a no-op for server-backed agents', () => {
		mockUsesLocalStatePersistence.mockReturnValue( false );
		sessionStorage.setItem( 'jetpack-reader-chat-open-some-agent', '1' );

		render( { agentId: 'some-agent', isOpen: true } );

		expect( setIsOpen ).not.toHaveBeenCalled();
		expect( sessionStorage.getItem( 'jetpack-reader-chat-open-some-agent' ) ).toBe( '1' );
	} );
} );
