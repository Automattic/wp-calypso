/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { requestSite } from 'calypso/state/sites/actions';
import { FAILURE_CONFIRM_ATTEMPTS, useAtomicTransfer } from '../use-atomic-transfer';
import { THANK_YOU_RECOVERY_INTERVAL_MS } from '../use-thank-you-deadline';

const mockDispatch = jest.fn();
let mockState = {
	siteId: 1 as number | null,
	isSiteAtomic: false,
	isJetpack: false,
	isAtomic: false,
	isFetchingTransferStatus: false,
	transferStatus: transferStates.ACTIVE as string | null,
};

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: typeof mockState ) => unknown ) => selector( mockState ),
} ) );
jest.mock( 'calypso/state/automated-transfer/actions', () => ( {
	fetchAutomatedTransferStatus: jest.fn(
		(
			siteId: number,
			{ resetPolling = false, singleCheck = false, retryOnFailure = false } = {}
		) => ( {
			type: 'FETCH_AUTOMATED_TRANSFER_STATUS',
			siteId,
			...( resetPolling ? { resetPolling: true } : {} ),
			...( singleCheck ? { singleCheck: true } : {} ),
			...( retryOnFailure ? { retryOnFailure: true } : {} ),
		} )
	),
} ) );
jest.mock( 'calypso/state/automated-transfer/selectors', () => ( {
	getAutomatedTransferStatus: ( state: typeof mockState ) => state.transferStatus,
	isFetchingAutomatedTransferStatus: ( state: typeof mockState ) => state.isFetchingTransferStatus,
} ) );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => ( {
	__esModule: true,
	default: ( state: typeof mockState ) => state.isAtomic,
} ) );
jest.mock( 'calypso/state/selectors/is-site-wpcom-atomic', () => ( {
	__esModule: true,
	default: ( state: typeof mockState ) => state.isSiteAtomic,
} ) );
jest.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: jest.fn( ( siteId: number ) => ( { type: 'REQUEST_SITE', siteId } ) ),
} ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	isJetpackSite: ( state: typeof mockState ) => state.isJetpack,
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: ( state: typeof mockState ) => state.siteId,
} ) );

const defaultState = { ...mockState };
const renderAtomic = ( isRecoveryMode = false ) =>
	renderHook( () => useAtomicTransfer( true, isRecoveryMode, true ) );
const INITIAL_FETCH_OPTIONS = 'start';
// Simulate a status response cycle so the hook observes the status from this wait.
const observeStatus = ( rerender: () => void, status: string ) => {
	mockState.isFetchingTransferStatus = true;
	rerender();
	mockState.isFetchingTransferStatus = false;
	mockState.transferStatus = status;
	rerender();
};

describe( 'useAtomicTransfer', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		mockDispatch.mockReset();
		mockState = { ...defaultState };
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'starts one transfer-status polling chain for the selected site', () => {
		const { rerender } = renderAtomic();

		expect( fetchAutomatedTransferStatus ).toHaveBeenCalledWith( 1, INITIAL_FETCH_OPTIONS );
		mockState.transferStatus = transferStates.PROVISIONED;
		rerender();

		expect( fetchAutomatedTransferStatus ).toHaveBeenCalledTimes( 1 );
	} );

	test.each( [
		transferStates.COMPLETE,
		transferStates.COMPLETED,
		transferStates.FAILURE,
		transferStates.ERROR,
		transferStates.CONFLICTS,
		transferStates.REVERTED,
	] )( 'refreshes a possibly stale persisted status at mount: %s', ( transferStatus ) => {
		mockState.transferStatus = transferStatus;
		renderAtomic();

		expect( fetchAutomatedTransferStatus ).toHaveBeenCalledWith( 1, INITIAL_FETCH_OPTIONS );
	} );

	it( 'polls site data for either completed spelling', () => {
		const { result, rerender } = renderAtomic();
		observeStatus( rerender, transferStates.COMPLETED );

		act( () => jest.advanceTimersByTime( 2000 ) );

		expect( requestSite ).toHaveBeenCalledWith( 1 );
		expect( result.current.currentStep ).toBe( 3 );
	} );

	it( 'does not start the atomic-flag poll from a stale persisted complete status', () => {
		mockState.transferStatus = transferStates.COMPLETE;
		renderAtomic();

		act( () => jest.advanceTimersByTime( 10000 ) );

		expect( requestSite ).not.toHaveBeenCalled();
	} );

	it( 'does not overlap site-data requests', async () => {
		let resolveRequest: () => void = () => {};
		const pendingRequest = new Promise< void >( ( resolve ) => {
			resolveRequest = resolve;
		} );
		mockDispatch.mockImplementation( ( action ) =>
			action.type === 'REQUEST_SITE' ? pendingRequest : undefined
		);
		const { rerender } = renderAtomic();
		observeStatus( rerender, transferStates.COMPLETE );

		act( () => jest.advanceTimersByTime( 10000 ) );
		expect( requestSite ).toHaveBeenCalledTimes( 1 );

		await act( async () => resolveRequest() );
		act( () => jest.advanceTimersByTime( 2000 ) );
		expect( requestSite ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'uses slow background checks after the page deadline', () => {
		const { rerender } = renderAtomic( true );
		observeStatus( rerender, transferStates.COMPLETE );

		act( () => jest.advanceTimersByTime( THANK_YOU_RECOVERY_INTERVAL_MS - 1 ) );
		expect( requestSite ).not.toHaveBeenCalled();
		act( () => jest.advanceTimersByTime( 1 ) );
		expect( requestSite ).toHaveBeenCalledWith( 1 );
	} );

	it( 'uses one-shot status checks while recovering from a transfer timeout', () => {
		mockState.transferStatus = transferStates.CLIENT_TIMEOUT;
		renderAtomic( true );

		expect( fetchAutomatedTransferStatus ).not.toHaveBeenCalled();
		act( () => jest.advanceTimersByTime( THANK_YOU_RECOVERY_INTERVAL_MS ) );
		expect( fetchAutomatedTransferStatus ).toHaveBeenCalledWith( 1, 'single' );
	} );

	it( 'waits for the durable deadline to initialize before starting status polling', () => {
		renderHook( () => useAtomicTransfer( true, false, false ) );

		expect( fetchAutomatedTransferStatus ).not.toHaveBeenCalled();
	} );

	it( 'restarts a failed status poll on explicit retry', () => {
		mockState.transferStatus = transferStates.REQUEST_FAILURE;
		const { result, rerender } = renderAtomic();
		jest.clearAllMocks();

		act( () => result.current.retry() );

		expect( fetchAutomatedTransferStatus ).toHaveBeenCalledWith( 1, 'start' );
		expect( result.current.isRetryingTransferStatus ).toBe( true );

		mockState.isFetchingTransferStatus = true;
		rerender();
		mockState.isFetchingTransferStatus = false;
		mockState.transferStatus = transferStates.ACTIVE;
		rerender();
		expect( result.current.isRetryingTransferStatus ).toBe( false );
	} );

	it( 'does not trust a settled failure before this wait confirms it', () => {
		const { result, rerender } = renderAtomic();

		mockState.isFetchingTransferStatus = true;
		rerender();
		mockState.isFetchingTransferStatus = false;
		mockState.transferStatus = transferStates.ERROR;
		rerender();

		expect( result.current.trustedTransferStatus ).toBeNull();

		jest.clearAllMocks();
		act( () => jest.advanceTimersByTime( 3000 ) );
		expect( fetchAutomatedTransferStatus ).toHaveBeenCalledWith( 1, 'start' );
	} );

	it( 'trusts a settled failure once every confirmation attempt still reports it', () => {
		const { result, rerender } = renderAtomic();

		for ( let attempt = 0; attempt <= FAILURE_CONFIRM_ATTEMPTS; attempt++ ) {
			mockState.isFetchingTransferStatus = true;
			rerender();
			mockState.isFetchingTransferStatus = false;
			mockState.transferStatus = transferStates.ERROR;
			rerender();
			act( () => jest.advanceTimersByTime( 3000 ) );
		}

		expect( result.current.trustedTransferStatus ).toBe( transferStates.ERROR );
	} );

	it( 'confirms a failure even after the transfer was seen progressing', () => {
		const { result, rerender } = renderAtomic();

		mockState.isFetchingTransferStatus = true;
		rerender();
		mockState.isFetchingTransferStatus = false;
		mockState.transferStatus = transferStates.ACTIVE;
		rerender();
		expect( result.current.trustedTransferStatus ).toBe( transferStates.ACTIVE );

		mockState.isFetchingTransferStatus = true;
		rerender();
		mockState.isFetchingTransferStatus = false;
		mockState.transferStatus = transferStates.ERROR;
		rerender();
		expect( result.current.trustedTransferStatus ).toBe( transferStates.ACTIVE );

		for ( let attempt = 0; attempt < FAILURE_CONFIRM_ATTEMPTS; attempt++ ) {
			act( () => jest.advanceTimersByTime( 3000 ) );
			mockState.isFetchingTransferStatus = true;
			rerender();
			mockState.isFetchingTransferStatus = false;
			rerender();
		}
		expect( result.current.trustedTransferStatus ).toBe( transferStates.ERROR );
	} );

	it( 'queues a retry clicked while a status request is in flight', () => {
		mockState.transferStatus = transferStates.CLIENT_TIMEOUT;
		mockState.isFetchingTransferStatus = true;
		const { result, rerender } = renderAtomic();
		jest.clearAllMocks();

		act( () => result.current.retry() );
		expect( fetchAutomatedTransferStatus ).not.toHaveBeenCalled();
		expect( result.current.isRetryingTransferStatus ).toBe( true );

		mockState.isFetchingTransferStatus = false;
		rerender();
		expect( fetchAutomatedTransferStatus ).toHaveBeenCalledWith( 1, 'start' );
	} );

	it( 'completes immediately once the site reports Atomic', () => {
		mockState.transferStatus = transferStates.COMPLETED;
		mockState.isSiteAtomic = true;

		const { result } = renderAtomic();

		expect( result.current.isAtomicTransferCheckComplete ).toBe( true );
		act( () => jest.advanceTimersByTime( THANK_YOU_RECOVERY_INTERVAL_MS ) );
		expect( requestSite ).not.toHaveBeenCalled();
		expect( fetchAutomatedTransferStatus ).not.toHaveBeenCalled();
	} );
} );
