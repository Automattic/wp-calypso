/**
 * @jest-environment jsdom
 */
let notify: () => void = () => {};
jest.mock( '@wordpress/data', () => ( {
	subscribe: jest.fn( ( listener: () => void ) => {
		notify = listener;
		return () => {
			notify = () => {};
		};
	} ),
} ) );

import { subscribe } from '@wordpress/data';
import { waitForStore } from '../wait-for-store';

beforeEach( () => {
	jest.clearAllMocks();
	jest.useFakeTimers();
} );

afterEach( () => {
	jest.useRealTimers();
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
		expect( jest.getTimerCount() ).toBe( 0 );
	} );

	it( 'resolves false once the timeout passes', async () => {
		const pending = waitForStore( 'core/editor', () => false, 1000 );

		jest.advanceTimersByTime( 1000 );

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
		jest.advanceTimersByTime( 1000 );

		await expect( pending ).resolves.toBe( false );
	} );

	it( 'settles once, even when the store keeps changing', async () => {
		let ready = false;
		const pending = waitForStore( 'core/editor', () => ready, 1000 );

		ready = true;
		notify();
		notify();
		jest.advanceTimersByTime( 1000 );

		await expect( pending ).resolves.toBe( true );
	} );
} );
