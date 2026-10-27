/** @jest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import { useTelegramBotWidget } from '../use-telegram-bot-widget';

jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn(), post: jest.fn() } } ) );
const mockDispatch = jest.fn();
jest.mock( 'react-redux', () => ( { useDispatch: () => mockDispatch } ) );
const mockTranslate = ( text: string ) => text;
jest.mock( 'i18n-calypso', () => ( { useTranslate: () => mockTranslate } ) );

const payload = { id: 123, username: 'telegram-user', auth_date: 123456789, hash: 'test-hash' };

beforeEach( () => {
	jest.clearAllMocks();
	jest.mocked( wpcom.req.get ).mockResolvedValue( { connected: false } );
	jest.mocked( wpcom.req.post ).mockResolvedValue( {} );
} );

test( 'requires confirmation and submits the displayed identity', async () => {
	const { result } = renderHook( () => useTelegramBotWidget() );
	await waitFor( () => expect( window.dollyOnTelegramAuth ).toBeDefined() );
	act( () => window.dollyOnTelegramAuth?.( payload ) );
	act( () => window.dollyOnTelegramAuth?.( { ...payload, id: 456 } ) );
	expect( result.current.pendingAuth ).toEqual( payload );
	expect( wpcom.req.post ).not.toHaveBeenCalled();
	await act( async () => result.current.handleConnect() );
	expect( wpcom.req.post ).toHaveBeenCalledTimes( 1 );
	expect( wpcom.req.post ).toHaveBeenCalledWith(
		{ path: '/telegram-bot/connect', apiNamespace: 'wpcom/v2' },
		payload
	);
	expect( result.current.pendingAuth ).toBeNull();
	expect( result.current.isConnected ).toBe( true );
} );

test( 'cancel discards the payload without connecting', async () => {
	const { result } = renderHook( () => useTelegramBotWidget() );
	await waitFor( () => expect( window.dollyOnTelegramAuth ).toBeDefined() );
	act( () => window.dollyOnTelegramAuth?.( payload ) );
	act( () => result.current.handleCancel() );
	act( () => result.current.handleConnect() );
	expect( result.current.pendingAuth ).toBeNull();
	expect( wpcom.req.post ).not.toHaveBeenCalled();
} );

test( 'retains the pending identity after a failed request for an explicit retry', async () => {
	jest.mocked( wpcom.req.post ).mockRejectedValueOnce( new Error( 'Try again' ) );
	const { result } = renderHook( () => useTelegramBotWidget() );
	await waitFor( () => expect( window.dollyOnTelegramAuth ).toBeDefined() );
	act( () => window.dollyOnTelegramAuth?.( payload ) );
	await act( async () => result.current.handleConnect() );
	expect( result.current.pendingAuth ).toEqual( payload );
	expect( result.current.isConnecting ).toBe( false );
	expect( result.current.isConnected ).toBe( false );
} );
