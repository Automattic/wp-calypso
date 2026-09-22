/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import { useWaitForAtomic, type FailureInfo } from '../use-wait-for-atomic';

const mockReduxDispatch = jest.fn();
const mockRequestLatestAtomicTransfer = jest.fn();
const mockGetSiteLatestAtomicTransfer = jest.fn();
const mockGetSiteLatestAtomicTransferError = jest.fn();

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockReduxDispatch,
} ) );
jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { requestLatestAtomicTransfer: mockRequestLatestAtomicTransfer } ),
	useSelect: () => ( {
		getSiteLatestAtomicTransfer: mockGetSiteLatestAtomicTransfer,
		getSiteLatestAtomicTransferError: mockGetSiteLatestAtomicTransferError,
	} ),
} ) );
jest.mock( 'react-router-dom', () => ( {
	useSearchParams: () => [ new URLSearchParams( 'feature=sftp' ) ],
} ) );
jest.mock( 'calypso/landing/stepper/stores', () => ( { SITE_STORE: 'site-store' } ) );
jest.mock( '../use-site-data', () => ( { useSiteData: () => ( { siteId: 123 } ) } ) );
jest.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: ( siteId: number ) => ( { type: 'REQUEST_SITE', siteId } ),
} ) );
jest.mock( 'calypso/state/sites/features/actions', () => ( {
	fetchSiteFeatures: jest.fn( ( siteId: number ) => ( { type: 'FETCH_FEATURES', siteId } ) ),
} ) );
jest.mock( 'calypso/state/themes/actions', () => ( {
	initiateThemeTransfer: jest.fn(),
} ) );

const SITE_ID = 123;

const renderWaitForAtomic = () => {
	const failures: FailureInfo[] = [];
	const { result } = renderHook( () =>
		useWaitForAtomic( {
			siteId: SITE_ID,
			handleTransferFailure: ( failureInfo ) => failures.push( failureInfo ),
		} )
	);
	return { result, failures };
};

// A transfer that began as this wait did, which is what the created_at-anchored clocks expect. A
// fixed date would read as an ancient transfer and trip them on the first poll.
const startedNow = () => new Date().toISOString().replace( 'T', ' ' ).slice( 0, 19 );

describe( 'useWaitForAtomic', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		mockReduxDispatch.mockReset();
		mockRequestLatestAtomicTransfer.mockReset();
		mockGetSiteLatestAtomicTransfer.mockReset();
		mockGetSiteLatestAtomicTransferError.mockReset();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	describe( 'waitForTransfer', () => {
		it( 'reports each polled transfer status, with the transfer’s own start', async () => {
			mockGetSiteLatestAtomicTransfer
				.mockReturnValueOnce( {
					atomic_transfer_id: 1,
					status: 'active',
					created_at: '2026-08-12 13:11:10',
				} )
				.mockReturnValueOnce( {
					atomic_transfer_id: 1,
					status: 'completed',
					created_at: '2026-08-12 13:11:10',
				} );
			const onTransferStatusChange = jest.fn();

			const { result } = renderWaitForAtomic();
			const promise = result.current.waitForTransfer( { onTransferStatusChange } );
			await jest.advanceTimersByTimeAsync( 6000 );

			await expect( promise ).resolves.toBeUndefined();
			expect( onTransferStatusChange ).toHaveBeenNthCalledWith(
				1,
				'active',
				'2026-08-12 13:11:10'
			);
			expect( onTransferStatusChange ).toHaveBeenNthCalledWith(
				2,
				'completed',
				'2026-08-12 13:11:10'
			);
		} );

		it( 'fails at the deadline when the caller has no way to handle it', async () => {
			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'active',
				created_at: '2026-08-12 13:11:10',
			} );

			const { result, failures } = renderWaitForAtomic();
			const promise = result.current.waitForTransfer();
			promise.catch( () => {} );
			await jest.advanceTimersByTimeAsync( 310_000 );

			await expect( promise ).rejects.toThrow( /taking longer than expected/i );
			expect( failures ).toEqual( [
				expect.objectContaining( { type: 'transfer_timeout', code: 'transfer_timeout' } ),
			] );
			expect( failures[ 0 ].recoverable ).toBeFalsy();
		} );

		it( 'keeps watching past the deadline and resolves when the transfer lands late', async () => {
			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'active',
				created_at: startedNow(),
			} );
			const onDeadlineExceeded = jest.fn();

			const { result, failures } = renderWaitForAtomic();
			const promise = result.current.waitForTransfer( { onDeadlineExceeded } );
			await jest.advanceTimersByTimeAsync( 310_000 );

			expect( onDeadlineExceeded ).toHaveBeenCalledTimes( 1 );
			expect( failures ).toEqual( [
				expect.objectContaining( { type: 'transfer_timeout', code: 'transfer_timeout' } ),
			] );

			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'completed',
				created_at: startedNow(),
			} );
			await jest.advanceTimersByTimeAsync( 11_000 );

			await expect( promise ).resolves.toBeUndefined();
			expect( onDeadlineExceeded ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'times the deadline from the transfer, not from when this wait started', async () => {
			// The wait re-enters (a reload) on a transfer that is already past the deadline.
			const startedSixMinutesAgo = new Date( Date.now() - 6 * 60 * 1000 )
				.toISOString()
				.replace( 'T', ' ' )
				.slice( 0, 19 );
			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'active',
				created_at: startedSixMinutesAgo,
			} );
			const onDeadlineExceeded = jest.fn();

			const { result } = renderWaitForAtomic();
			result.current.waitForTransfer( { onDeadlineExceeded } ).catch( () => {} );
			await jest.advanceTimersByTimeAsync( 4000 );

			expect( onDeadlineExceeded ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does not anchor a new wait to an old transfer reverting in the background', async () => {
			const startedSixMinutesAgo = new Date( Date.now() - 6 * 60 * 1000 )
				.toISOString()
				.replace( 'T', ' ' )
				.slice( 0, 19 );
			mockGetSiteLatestAtomicTransfer
				.mockReturnValueOnce( {
					atomic_transfer_id: 1,
					status: 'renaming',
					created_at: startedSixMinutesAgo,
				} )
				.mockReturnValue( {
					atomic_transfer_id: 2,
					status: 'completed',
					created_at: startedSixMinutesAgo,
				} );
			const onDeadlineExceeded = jest.fn();

			const { result, failures } = renderWaitForAtomic();
			const promise = result.current.waitForTransfer( { onDeadlineExceeded } );
			await jest.advanceTimersByTimeAsync( 6000 );

			await expect( promise ).resolves.toBeUndefined();
			expect( onDeadlineExceeded ).not.toHaveBeenCalled();
			expect( failures ).toEqual( [] );
		} );

		it( 're-anchors the deadline when a different in-flight transfer appears', async () => {
			const startedFourMinutesAgo = new Date( Date.now() - 4 * 60 * 1000 )
				.toISOString()
				.replace( 'T', ' ' )
				.slice( 0, 19 );
			const newTransferStartedAt = new Date().toISOString().replace( 'T', ' ' ).slice( 0, 19 );
			mockGetSiteLatestAtomicTransfer
				.mockReturnValueOnce( {
					atomic_transfer_id: 1,
					status: 'active',
					created_at: startedFourMinutesAgo,
				} )
				.mockReturnValue( {
					atomic_transfer_id: 2,
					status: 'active',
					created_at: newTransferStartedAt,
				} );
			const onDeadlineExceeded = jest.fn();

			const { result, failures } = renderWaitForAtomic();
			const promise = result.current.waitForTransfer( { onDeadlineExceeded } );
			await jest.advanceTimersByTimeAsync( 70_000 );

			expect( onDeadlineExceeded ).not.toHaveBeenCalled();
			expect( failures ).toEqual( [] );

			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 2,
				status: 'completed',
				created_at: newTransferStartedAt,
			} );
			await jest.advanceTimersByTimeAsync( 3000 );

			await expect( promise ).resolves.toBeUndefined();
			expect( onDeadlineExceeded ).not.toHaveBeenCalled();
			expect( failures ).toEqual( [] );
		} );

		it( 'anchors a reload during the switch-over to the original transfer start', async () => {
			// `relocating_switcheroo` is the last forward step, and a reload can land on it.
			const startedSixMinutesAgo = new Date( Date.now() - 6 * 60 * 1000 )
				.toISOString()
				.replace( 'T', ' ' )
				.slice( 0, 19 );
			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'relocating_switcheroo',
				created_at: startedSixMinutesAgo,
			} );
			const onDeadlineExceeded = jest.fn();

			const { result } = renderWaitForAtomic();
			result.current.waitForTransfer( { onDeadlineExceeded } ).catch( () => {} );
			await jest.advanceTimersByTimeAsync( 4000 );

			expect( onDeadlineExceeded ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'does not let the revert pipeline of a previous transfer anchor the clock', async () => {
			const revertedLongAgo = new Date( Date.now() - 6 * 60 * 1000 )
				.toISOString()
				.replace( 'T', ' ' )
				.slice( 0, 19 );
			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'cleanup',
				created_at: revertedLongAgo,
			} );
			const onDeadlineExceeded = jest.fn();

			const { result } = renderWaitForAtomic();
			result.current.waitForTransfer( { onDeadlineExceeded } ).catch( () => {} );
			await jest.advanceTimersByTimeAsync( 4000 );

			expect( onDeadlineExceeded ).not.toHaveBeenCalled();
		} );

		it( 'keeps waiting while a previous transfer finishes reverting', async () => {
			// The old transfer is still the latest one, working through the lossless-revert pipeline.
			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'renaming',
				created_at: startedNow(),
			} );

			const { result, failures } = renderWaitForAtomic();
			const promise = result.current.waitForTransfer( { onDeadlineExceeded: jest.fn() } );
			promise.catch( () => {} );
			await jest.advanceTimersByTimeAsync( 4000 );

			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'reverted',
				created_at: startedNow(),
			} );
			await jest.advanceTimersByTimeAsync( 4000 );

			expect( failures ).not.toContainEqual(
				expect.objectContaining( { type: 'transfer_reverted' } )
			);

			// Ours turns up and the wait finishes on it.
			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 2,
				status: 'completed',
				created_at: startedNow(),
			} );
			await jest.advanceTimersByTimeAsync( 4000 );

			await expect( promise ).resolves.toBeUndefined();
		} );

		it( 'lets a completed transfer win over the cap it crossed on the same poll', async () => {
			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'active',
				created_at: startedNow(),
			} );

			const { result, failures } = renderWaitForAtomic();
			const promise = result.current.waitForTransfer( { onDeadlineExceeded: jest.fn() } );
			promise.catch( () => {} );
			// Stop just short of the cap, then let the next poll bring the completion.
			await jest.advanceTimersByTimeAsync( 890_000 );

			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'completed',
				created_at: startedNow(),
			} );
			await jest.advanceTimersByTimeAsync( 30_000 );

			await expect( promise ).resolves.toBeUndefined();
			expect( failures ).not.toContainEqual(
				expect.objectContaining( { type: 'transfer_grace_timeout' } )
			);
		} );

		it( 'gives up at the grace cap when the transfer never lands', async () => {
			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'active',
				created_at: startedNow(),
			} );

			const { result, failures } = renderWaitForAtomic();
			const promise = result.current.waitForTransfer( { onDeadlineExceeded: jest.fn() } );
			promise.catch( () => {} );
			await jest.advanceTimersByTimeAsync( 920_000 );

			await expect( promise ).rejects.toThrow( /taking longer than expected/i );
			expect( failures ).toEqual( [
				expect.objectContaining( { type: 'transfer_timeout' } ),
				expect.objectContaining( {
					type: 'transfer_grace_timeout',
					code: 'transfer_grace_timeout',
				} ),
			] );
		} );

		it( 'caps from the transfer, giving a re-entered wait a look before it gives up', async () => {
			// A reload onto a transfer that is already past the cap.
			const startedTwentyMinutesAgo = new Date( Date.now() - 20 * 60 * 1000 )
				.toISOString()
				.replace( 'T', ' ' )
				.slice( 0, 19 );
			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'active',
				created_at: startedTwentyMinutesAgo,
			} );

			const { result, failures } = renderWaitForAtomic();
			const promise = result.current.waitForTransfer( { onDeadlineExceeded: jest.fn() } );
			promise.catch( () => {} );

			// The wait is still up while it takes its own look at the transfer.
			await jest.advanceTimersByTimeAsync( 20_000 );
			expect( failures ).not.toContainEqual(
				expect.objectContaining( { type: 'transfer_grace_timeout' } )
			);

			// It does not get another fifteen minutes, though.
			await jest.advanceTimersByTimeAsync( 20_000 );
			await expect( promise ).rejects.toThrow( /taking longer than expected/i );
			expect( failures ).toContainEqual(
				expect.objectContaining( { type: 'transfer_grace_timeout' } )
			);
		} );

		it( 'takes a late completion over the cap a reload arrived after', async () => {
			const startedTwentyMinutesAgo = new Date( Date.now() - 20 * 60 * 1000 )
				.toISOString()
				.replace( 'T', ' ' )
				.slice( 0, 19 );
			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'active',
				created_at: startedTwentyMinutesAgo,
			} );

			const { result } = renderWaitForAtomic();
			const promise = result.current.waitForTransfer( { onDeadlineExceeded: jest.fn() } );
			promise.catch( () => {} );
			await jest.advanceTimersByTimeAsync( 4000 );

			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'completed',
				created_at: startedTwentyMinutesAgo,
			} );
			await jest.advanceTimersByTimeAsync( 11_000 );

			await expect( promise ).resolves.toBeUndefined();
		} );

		it( 'still fails immediately on a transfer error while past the deadline', async () => {
			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'active',
				created_at: startedNow(),
			} );

			const { result, failures } = renderWaitForAtomic();
			const promise = result.current.waitForTransfer( { onDeadlineExceeded: jest.fn() } );
			promise.catch( () => {} );
			await jest.advanceTimersByTimeAsync( 310_000 );

			mockGetSiteLatestAtomicTransfer.mockReturnValue( {
				atomic_transfer_id: 1,
				status: 'error',
				created_at: startedNow(),
			} );
			await jest.advanceTimersByTimeAsync( 11_000 );

			await expect( promise ).rejects.toThrow( /something went wrong/i );
			expect( failures ).toEqual( [
				expect.objectContaining( { type: 'transfer_timeout' } ),
				expect.objectContaining( { type: 'transfer' } ),
			] );
		} );
	} );

	describe( 'waitForFeature', () => {
		it( 'resolves once the feature is active', async () => {
			mockReduxDispatch
				.mockResolvedValueOnce( { active: [] } )
				.mockResolvedValue( { active: [ 'sftp' ] } );

			const { result } = renderWaitForAtomic();
			const promise = result.current.waitForFeature();
			await jest.advanceTimersByTimeAsync( 2000 );

			await expect( promise ).resolves.toBeUndefined();
			expect( fetchSiteFeatures ).toHaveBeenCalledWith( SITE_ID );
		} );

		it( 'fails after repeated swallowed fetch errors instead of looping forever', async () => {
			mockReduxDispatch.mockResolvedValue( undefined );

			const { result, failures } = renderWaitForAtomic();
			const promise = result.current.waitForFeature();
			promise.catch( () => {} );
			await jest.advanceTimersByTimeAsync( 10_000 );

			await expect( promise ).rejects.toThrow();
			expect( failures ).toEqual( [
				expect.objectContaining( { type: 'feature_fetch', code: 'feature_fetch_failed' } ),
			] );
			expect( mockReduxDispatch ).toHaveBeenCalledTimes( 5 );
		} );

		it( 'fails with a timeout when the feature never activates', async () => {
			mockReduxDispatch.mockResolvedValue( { active: [ 'some-other-feature' ] } );

			const { result, failures } = renderWaitForAtomic();
			const promise = result.current.waitForFeature();
			promise.catch( () => {} );
			await jest.advanceTimersByTimeAsync( 181_000 );

			await expect( promise ).rejects.toThrow();
			expect( failures ).toEqual( [
				expect.objectContaining( { type: 'feature_timeout', code: 'feature_timeout' } ),
			] );
		} );
	} );

	describe( 'waitForLatestSiteData', () => {
		it( 'resolves once the site is atomic and manageable', async () => {
			mockReduxDispatch
				.mockResolvedValueOnce( { options: { is_wpcom_atomic: true }, capabilities: {} } )
				.mockResolvedValue( {
					options: { is_wpcom_atomic: true },
					capabilities: { manage_options: true },
				} );

			const { result } = renderWaitForAtomic();
			const promise = result.current.waitForLatestSiteData();
			await jest.advanceTimersByTimeAsync( 2000 );

			await expect( promise ).resolves.toBeUndefined();
		} );

		it( 'fails with a timeout when the site data never reflects the transfer', async () => {
			mockReduxDispatch.mockResolvedValue( {
				options: { is_wpcom_atomic: false },
				capabilities: { manage_options: true },
			} );

			const { result, failures } = renderWaitForAtomic();
			const promise = result.current.waitForLatestSiteData();
			promise.catch( () => {} );
			await jest.advanceTimersByTimeAsync( 181_000 );

			await expect( promise ).rejects.toThrow();
			expect( failures ).toEqual( [
				expect.objectContaining( { type: 'site_data_timeout', code: 'site_data_timeout' } ),
			] );
		} );
	} );
} );
