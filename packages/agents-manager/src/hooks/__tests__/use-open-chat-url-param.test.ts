/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'automattic/agents-manager' } ) );
jest.mock( '../../utils/is-reader-chat-agent', () => ( { isReaderChatHost: jest.fn() } ) );
jest.mock( '../../utils/tracks', () => ( { recordBigSkyTracksEvent: jest.fn() } ) );
jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn(),
	useSelect: jest.fn(),
} ) );

import { renderHook } from '@testing-library/react';
import { useDispatch, useSelect } from '@wordpress/data';
import { isReaderChatHost } from '../../utils/is-reader-chat-agent';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import { useOpenChatUrlParam } from '../use-open-chat-url-param';

const mockUseDispatch = useDispatch as jest.Mock;
const mockUseSelect = useSelect as jest.Mock;
const mockIsReaderChatHost = isReaderChatHost as jest.Mock;

const setIsOpen = jest.fn();
const setIsMinimized = jest.fn();

const mockStoreState = (
	state: { hasLoaded?: boolean; isOpen?: boolean; isMinimized?: boolean } = {}
) => {
	mockUseSelect.mockImplementation( () => ( {
		hasLoaded: true,
		isOpen: false,
		isMinimized: false,
		...state,
	} ) );
};

describe( 'useOpenChatUrlParam', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockUseDispatch.mockReturnValue( { setIsOpen, setIsMinimized } );
		mockIsReaderChatHost.mockReturnValue( false );
		mockStoreState();
		window.history.replaceState( null, '', '/' );
	} );

	it.each( [
		{
			isOpen: false,
			isMinimized: true,
			openCalls: [ [ true, true ] ],
			minimizeCalls: [ [ false, true ] ],
			handled: false,
		},
		{
			isOpen: false,
			isMinimized: false,
			openCalls: [ [ true, true ] ],
			minimizeCalls: [],
			handled: false,
		},
		{
			isOpen: true,
			isMinimized: true,
			openCalls: [],
			minimizeCalls: [ [ false, true ] ],
			handled: false,
		},
		{ isOpen: true, isMinimized: false, openCalls: [], minimizeCalls: [], handled: true },
	] )(
		'dispatches only the needed updates when isOpen=$isOpen and isMinimized=$isMinimized',
		( { isOpen, isMinimized, openCalls, minimizeCalls, handled } ) => {
			window.history.replaceState( null, '', '/?ai-open=true' );
			mockStoreState( { isOpen, isMinimized } );

			const { result } = renderHook( () => useOpenChatUrlParam() );

			expect( setIsOpen.mock.calls ).toEqual( openCalls );
			expect( setIsMinimized.mock.calls ).toEqual( minimizeCalls );
			expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'ai_editor_menu_opened' );
			expect( window.location.search ).toBe( '' );
			expect( result.current ).toBe( handled );
		}
	);

	it( 'strips only `ai-open` and reports handled once the store reflects the open state', () => {
		window.history.replaceState( null, '', '/?canvas=edit&ai-open=true' );
		mockStoreState( { isMinimized: true } );

		const { result, rerender } = renderHook( () => useOpenChatUrlParam() );

		expect( result.current ).toBe( false );
		expect( window.location.search ).toBe( '?canvas=edit' );

		mockStoreState( { isOpen: true } );
		rerender();

		expect( result.current ).toBe( true );
		expect( setIsOpen ).toHaveBeenCalledTimes( 1 );
		expect( setIsMinimized ).toHaveBeenCalledTimes( 1 );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );
	} );

	it.each( [ '/', '/?ai-open=false', '/?ai-open=1' ] )( 'does nothing for URL `%s`', ( url ) => {
		window.history.replaceState( null, '', url );

		const { result } = renderHook( () => useOpenChatUrlParam() );

		expect( result.current ).toBe( true );
		expect( setIsOpen ).not.toHaveBeenCalled();
		expect( setIsMinimized ).not.toHaveBeenCalled();
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalled();
		expect( window.location.pathname + window.location.search ).toBe( url );
	} );

	it( 'opens even when the host rewrote the URL before the persisted state loaded', () => {
		window.history.replaceState( null, '', '/?ai-open=true' );
		mockStoreState( { hasLoaded: false } );

		const { rerender } = renderHook( () => useOpenChatUrlParam() );

		// Simulate the Site Editor router dropping the param during boot.
		window.history.replaceState( null, '', '/?canvas=edit' );
		mockStoreState( { hasLoaded: true } );
		rerender();

		expect( setIsOpen ).toHaveBeenCalledWith( true, true );
		expect( window.location.search ).toBe( '?canvas=edit' );
	} );

	it( 'waits for the persisted state to load before opening', () => {
		window.history.replaceState( null, '', '/?ai-open=true' );
		mockStoreState( { hasLoaded: false } );

		const { result, rerender } = renderHook( () => useOpenChatUrlParam() );

		expect( result.current ).toBe( false );
		expect( setIsOpen ).not.toHaveBeenCalled();
		expect( window.location.search ).toBe( '?ai-open=true' );

		mockStoreState( { hasLoaded: true } );
		rerender();

		expect( setIsOpen ).toHaveBeenCalledWith( true, true );
		expect( window.location.search ).toBe( '' );

		mockStoreState( { isOpen: true } );
		rerender();

		expect( result.current ).toBe( true );
	} );

	it( 'opens without persisting or tracking on reader-chat hosts', () => {
		window.history.replaceState( null, '', '/?ai-open=true' );
		mockStoreState( { isMinimized: true } );
		mockIsReaderChatHost.mockReturnValue( true );

		renderHook( () => useOpenChatUrlParam() );

		expect( setIsOpen ).toHaveBeenCalledWith( true, false );
		expect( setIsMinimized ).toHaveBeenCalledWith( false, false );
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'preserves the existing history state when stripping the param', () => {
		window.history.replaceState( { canvas: 'edit' }, '', '/?ai-open=true' );

		renderHook( () => useOpenChatUrlParam() );

		expect( window.history.state ).toEqual( { canvas: 'edit' } );
		expect( window.location.search ).toBe( '' );
	} );
} );
