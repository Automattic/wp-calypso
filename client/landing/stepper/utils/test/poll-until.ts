import { pollUntil, PollTimeoutError } from '../poll-until';

describe( 'pollUntil', () => {
	it( 'returns the first defined result without extra attempts', async () => {
		const check = jest.fn().mockResolvedValue( 'ready' );

		await expect( pollUntil( check, { maxAttempts: 3, intervalMs: 0 } ) ).resolves.toBe( 'ready' );
		expect( check ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps polling while the check returns undefined', async () => {
		const check = jest
			.fn()
			.mockResolvedValueOnce( undefined )
			.mockResolvedValueOnce( undefined )
			.mockResolvedValueOnce( 'ready' );

		await expect( pollUntil( check, { maxAttempts: 5, intervalMs: 0 } ) ).resolves.toBe( 'ready' );
		expect( check ).toHaveBeenCalledTimes( 3 );
	} );

	it( 'treats a thrown error as "not ready yet" and keeps polling', async () => {
		const check = jest
			.fn()
			.mockRejectedValueOnce( new Error( 'transient' ) )
			.mockResolvedValueOnce( 'ready' );

		await expect( pollUntil( check, { maxAttempts: 3, intervalMs: 0 } ) ).resolves.toBe( 'ready' );
		expect( check ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'throws PollTimeoutError once the attempts are exhausted', async () => {
		const check = jest.fn().mockResolvedValue( undefined );

		await expect( pollUntil( check, { maxAttempts: 2, intervalMs: 0 } ) ).rejects.toBeInstanceOf(
			PollTimeoutError
		);
		expect( check ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'passes the 1-based attempt number to the check', async () => {
		const attempts: number[] = [];
		const check = jest.fn( async ( attempt: number ) => {
			attempts.push( attempt );
			return attempt === 2 ? 'ready' : undefined;
		} );

		await pollUntil( check, { maxAttempts: 3, intervalMs: 0 } );
		expect( attempts ).toEqual( [ 1, 2 ] );
	} );
} );
