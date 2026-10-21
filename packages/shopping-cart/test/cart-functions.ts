import { findCartKeyFromSiteSlug } from '../src/cart-functions';
import type { ResponseCart } from '../src/types';

jest.useFakeTimers();

const cart = { cart_key: 12345 } as ResponseCart;
const never = () => new Promise< ResponseCart >( () => {} );

describe( 'findCartKeyFromSiteSlug', () => {
	it( 'returns the cart key from the first attempt', async () => {
		const getCart = jest.fn().mockResolvedValue( cart );
		await expect( findCartKeyFromSiteSlug( 'example.wordpress.com', getCart ) ).resolves.toBe(
			12345
		);
		expect( getCart ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'retries a hung request and returns the cart key from the next attempt', async () => {
		const getCart = jest.fn().mockImplementationOnce( never ).mockResolvedValue( cart );
		const promise = findCartKeyFromSiteSlug( 'example.wordpress.com', getCart );
		await jest.advanceTimersByTimeAsync( 1000 );
		await expect( promise ).resolves.toBe( 12345 );
		expect( getCart ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'returns no-site after three timed-out attempts', async () => {
		const getCart = jest.fn().mockImplementation( never );
		const promise = findCartKeyFromSiteSlug( 'example.wordpress.com', getCart );
		await jest.advanceTimersByTimeAsync( 3000 );
		await expect( promise ).resolves.toBe( 'no-site' );
		expect( getCart ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'returns no-site on a non-timeout error after a timeout without further retries', async () => {
		const getCart = jest
			.fn()
			.mockImplementationOnce( never )
			.mockRejectedValue( new Error( 'not found' ) );
		const promise = findCartKeyFromSiteSlug( 'example.wordpress.com', getCart );
		await jest.advanceTimersByTimeAsync( 1000 );
		await expect( promise ).resolves.toBe( 'no-site' );
		expect( getCart ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'returns no-site when getCart throws synchronously', async () => {
		const getCart = jest.fn().mockImplementation( () => {
			throw new Error( 'sync throw' );
		} );
		await expect( findCartKeyFromSiteSlug( 'example.wordpress.com', getCart ) ).resolves.toBe(
			'no-site'
		);
		expect( getCart ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'returns no-site on a non-timeout error without retrying', async () => {
		const getCart = jest.fn().mockRejectedValue( new Error( 'not found' ) );
		await expect( findCartKeyFromSiteSlug( 'example.wordpress.com', getCart ) ).resolves.toBe(
			'no-site'
		);
		expect( getCart ).toHaveBeenCalledTimes( 1 );
	} );
} );
