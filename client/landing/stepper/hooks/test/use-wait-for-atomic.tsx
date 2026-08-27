/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import { useWaitForAtomic, type FailureInfo } from '../use-wait-for-atomic';

const mockReduxDispatch = jest.fn();

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockReduxDispatch,
} ) );
jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { requestLatestAtomicTransfer: jest.fn() } ),
	useSelect: () => ( {
		getSiteLatestAtomicTransfer: jest.fn(),
		getSiteLatestAtomicTransferError: jest.fn(),
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

describe( 'useWaitForAtomic', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		mockReduxDispatch.mockReset();
	} );

	afterEach( () => {
		jest.useRealTimers();
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
