/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order */
import { vi } from 'vitest';
let notify: () => void = () => {};
vi.mock( '@wordpress/data', () => ( {
	subscribe: vi.fn( ( listener: () => void ) => {
		notify = listener;
		return () => {
			notify = () => {};
		};
	} ),
} ) );

import { subscribe } from '@wordpress/data';
import { waitForStore } from '../wait-for-store';

beforeEach( () => {
	vi.clearAllMocks();
	vi.useFakeTimers();
} );

afterEach( () => {
	vi.useRealTimers();
} );

describe( 'waitForStore', () => {
	it( 'resolves without subscribing when the state is already there', async () => {
		await expect( waitForStore( 'core/editor', () => true, 1000 ) ).resolves.toBe( true );

		expect( subscribe ).not.toHaveBeenCalled();
	} );

	it( 'resolves on the store change that satisfies it, and unsubscribes', async () => {
		let ready = false;
		const pending = waitForStore( 'core/editor', () => ready, 1000 );

		ready = true;
		notify();

		await expect( pending ).resolves.toBe( true );
		// The timer must not outlive the wait.
		expect( vi.getTimerCount() ).toBe( 0 );
	} );

	it( 'resolves false once the timeout passes', async () => {
		const pending = waitForStore( 'core/editor', () => false, 1000 );

		vi.advanceTimersByTime( 1000 );

		await expect( pending ).resolves.toBe( false );
	} );

	it( 'treats a throwing selector as not ready, rather than throwing', async () => {
		const pending = waitForStore(
			'core/editor',
			() => {
				throw new Error( 'store unavailable' );
			},
			1000
		);

		notify();
		vi.advanceTimersByTime( 1000 );

		await expect( pending ).resolves.toBe( false );
	} );

	it( 'listens to every store it names, and stops listening to all of them', async () => {
		const unsubscribes = [ vi.fn(), vi.fn() ];
		const listeners: ( () => void )[] = [];

		const listen = ( listener: () => void ) => {
			listeners.push( listener );
			return unsubscribes[ listeners.length - 1 ];
		};

		vi.mocked( subscribe ).mockImplementationOnce( listen ).mockImplementationOnce( listen );

		let ready = false;
		const pending = waitForStore( [ 'core/block-editor', 'core' ], () => ready, 1000 );

		expect( subscribe ).toHaveBeenCalledWith( expect.any( Function ), 'core/block-editor' );
		expect( subscribe ).toHaveBeenCalledWith( expect.any( Function ), 'core' );

		ready = true;
		listeners[ 1 ]();

		await expect( pending ).resolves.toBe( true );
		unsubscribes.forEach( ( unsubscribe ) => expect( unsubscribe ).toHaveBeenCalled() );
	} );

	it( 'settles once, even when the store keeps changing', async () => {
		let ready = false;
		const pending = waitForStore( 'core/editor', () => ready, 1000 );

		ready = true;
		notify();
		notify();
		vi.advanceTimersByTime( 1000 );

		await expect( pending ).resolves.toBe( true );
	} );
} );
