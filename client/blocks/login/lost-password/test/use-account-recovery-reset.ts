/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import wp from 'calypso/lib/wp';
import {
	lookup,
	requestReset,
	validate,
	reset,
	useAccountRecoveryReset,
} from '../use-account-recovery-reset';

jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { get: jest.fn(), post: jest.fn() } },
} ) );

const mockedGet = wp.req.get as jest.Mock;
const mockedPost = wp.req.post as jest.Mock;

const userData = { user: 'someone@example.com' };

beforeEach( () => {
	jest.clearAllMocks();
} );

describe( 'lookup', () => {
	it( 'requests the lookup endpoint with the user data as the query', async () => {
		mockedGet.mockResolvedValue( {} );

		await lookup( userData );

		expect( mockedGet ).toHaveBeenCalledWith(
			{ path: '/account-recovery/lookup', apiNamespace: 'wpcom/v2' },
			userData
		);
	} );

	it( 'returns only configured methods, dropping empty/whitespace-only hints', async () => {
		mockedGet.mockResolvedValue( {
			primary_email: 'j****e@gmail.com',
			secondary_email: '',
			primary_sms: '   ',
			secondary_sms: '+44*******21',
		} );

		await expect( lookup( userData ) ).resolves.toEqual( {
			primary_email: 'j****e@gmail.com',
			secondary_sms: '+44*******21',
		} );
	} );

	it( 'returns an empty object when nothing is configured', async () => {
		mockedGet.mockResolvedValue( {
			primary_email: '',
			secondary_email: '',
			primary_sms: '',
			secondary_sms: '',
		} );

		await expect( lookup( userData ) ).resolves.toEqual( {} );
	} );

	it( 'tolerates missing keys in the response', async () => {
		mockedGet.mockResolvedValue( { primary_email: 'j****e@gmail.com' } );

		await expect( lookup( userData ) ).resolves.toEqual( {
			primary_email: 'j****e@gmail.com',
		} );
	} );

	it( 'propagates API errors', async () => {
		const error = new Error( 'lookup failed' );
		mockedGet.mockRejectedValue( error );

		await expect( lookup( userData ) ).rejects.toBe( error );
	} );
} );

describe( 'requestReset', () => {
	it( 'posts the method and user data', async () => {
		mockedPost.mockResolvedValue( true );

		await requestReset( { userData, method: 'secondary_sms' } );

		expect( mockedPost ).toHaveBeenCalledWith(
			{ path: '/account-recovery/request-reset', apiNamespace: 'wpcom/v2' },
			{},
			{ user: 'someone@example.com', method: 'secondary_sms' }
		);
	} );

	it( 'includes the TOTP app-code for the authenticator method', async () => {
		mockedPost.mockResolvedValue( true );

		await requestReset( { userData, method: 'authenticator_app', appCode: '123456' } );

		expect( mockedPost ).toHaveBeenCalledWith(
			{ path: '/account-recovery/request-reset', apiNamespace: 'wpcom/v2' },
			{},
			{ user: 'someone@example.com', method: 'authenticator_app', 'app-code': '123456' }
		);
	} );

	it( 'omits app-code for non-authenticator methods even if one is passed', async () => {
		mockedPost.mockResolvedValue( true );

		await requestReset( { userData, method: 'primary_email', appCode: '123456' } );

		expect( mockedPost ).toHaveBeenCalledWith(
			{ path: '/account-recovery/request-reset', apiNamespace: 'wpcom/v2' },
			{},
			{ user: 'someone@example.com', method: 'primary_email' }
		);
	} );

	it( 'supports the firstname/lastname/url identity', async () => {
		mockedPost.mockResolvedValue( true );
		const altIdentity = { firstname: 'Jane', lastname: 'Doe', url: 'jane.example.com' };

		await requestReset( { userData: altIdentity, method: 'secondary_email' } );

		expect( mockedPost ).toHaveBeenCalledWith(
			{ path: '/account-recovery/request-reset', apiNamespace: 'wpcom/v2' },
			{},
			{ ...altIdentity, method: 'secondary_email' }
		);
	} );
} );

describe( 'validate', () => {
	it( 'posts the method and key', async () => {
		mockedPost.mockResolvedValue( true );

		await validate( { userData, method: 'secondary_sms', key: '12345678' } );

		expect( mockedPost ).toHaveBeenCalledWith(
			{ path: '/account-recovery/validate', apiNamespace: 'wpcom/v2' },
			{},
			{ user: 'someone@example.com', method: 'secondary_sms', key: '12345678' }
		);
	} );
} );

describe( 'reset', () => {
	it( 'posts the method, key and new password', async () => {
		mockedPost.mockResolvedValue( 12345 );

		await reset( {
			userData,
			method: 'secondary_sms',
			key: '12345678',
			password: 'a-strong-password',
		} );

		expect( mockedPost ).toHaveBeenCalledWith(
			{ path: '/account-recovery/reset', apiNamespace: 'wpcom/v2' },
			{},
			{
				user: 'someone@example.com',
				method: 'secondary_sms',
				key: '12345678',
				password: 'a-strong-password',
			}
		);
	} );
} );

describe( 'useAccountRecoveryReset', () => {
	it( 'returns stable references to the four calls', () => {
		const { result, rerender } = renderHook( () => useAccountRecoveryReset() );
		const first = result.current;

		expect( Object.keys( first ).sort() ).toEqual( [
			'lookup',
			'requestReset',
			'reset',
			'validate',
		] );

		rerender();
		expect( result.current ).toBe( first );
	} );
} );
