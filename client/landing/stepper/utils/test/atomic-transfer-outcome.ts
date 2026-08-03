import {
	createRevertedTransferWatcher,
	getTransferFailureMessage,
	isRevertedTransferStatus,
} from '../atomic-transfer-outcome';

describe( 'isRevertedTransferStatus', () => {
	it.each( [ 'reverted', 'reverting', 'relocating_revert' ] )(
		'treats %s as a transfer that will not complete',
		( status ) => {
			expect( isRevertedTransferStatus( status ) ).toBe( true );
		}
	);

	it.each( [
		'pending',
		'active',
		'provisioned',
		'completed',
		'error',
		'relocating_switcheroo',
		'renaming',
		'exporting',
		'importing',
		'cleanup',
	] )( 'leaves %s alone', ( status ) => {
		expect( isRevertedTransferStatus( status ) ).toBe( false );
	} );

	it( 'handles a missing status', () => {
		expect( isRevertedTransferStatus( undefined ) ).toBe( false );
	} );
} );

describe( 'createRevertedTransferWatcher', () => {
	it( 'reports a revert once the transfer it is watching rolls back', () => {
		const isRevertOfThisTransfer = createRevertedTransferWatcher();

		expect( isRevertOfThisTransfer( { atomic_transfer_id: 7, status: 'pending' } ) ).toBe( false );
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 7, status: 'active' } ) ).toBe( false );
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 7, status: 'reverting' } ) ).toBe( true );
	} );

	it( 'ignores a previous transfer that was already reverted before this wait', () => {
		const isRevertOfThisTransfer = createRevertedTransferWatcher();

		// Latest transfer is still the old one.
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 1, status: 'reverted' } ) ).toBe( false );
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 1, status: 'reverted' } ) ).toBe( false );

		// The new one shows up.
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 2, status: 'pending' } ) ).toBe( false );
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 2, status: 'active' } ) ).toBe( false );

		// Only its revert counts.
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 2, status: 'reverted' } ) ).toBe( true );
	} );

	it( 'does not fire on an empty poll', () => {
		const isRevertOfThisTransfer = createRevertedTransferWatcher();

		expect( isRevertOfThisTransfer( undefined ) ).toBe( false );
		expect( isRevertOfThisTransfer( { status: 'reverted' } ) ).toBe( false );
	} );

	it( 'catches a transfer that rolled back before the first poll', () => {
		const isRevertOfThisTransfer = createRevertedTransferWatcher();

		// Already reverting on arrival, and nothing replaces it.
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 9, status: 'reverting' } ) ).toBe(
			false
		);
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 9, status: 'reverting' } ) ).toBe(
			false
		);
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 9, status: 'reverted' } ) ).toBe( false );
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 9, status: 'reverted' } ) ).toBe( false );

		// Fifth poll: nothing is coming.
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 9, status: 'reverted' } ) ).toBe( true );
	} );

	it( 'still stands down if a new transfer replaces a stale reverted one', () => {
		const isRevertOfThisTransfer = createRevertedTransferWatcher();

		// Same start, but this one is history.
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 1, status: 'reverted' } ) ).toBe( false );
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 1, status: 'reverted' } ) ).toBe( false );

		// Real transfer arrives in time.
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 2, status: 'pending' } ) ).toBe( false );

		// Old record no longer counts.
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 2, status: 'active' } ) ).toBe( false );
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 2, status: 'completed' } ) ).toBe(
			false
		);
	} );

	it( 'restarts the count when a different reverted transfer appears', () => {
		const isRevertOfThisTransfer = createRevertedTransferWatcher();

		expect( isRevertOfThisTransfer( { atomic_transfer_id: 1, status: 'reverted' } ) ).toBe( false );
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 1, status: 'reverted' } ) ).toBe( false );
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 1, status: 'reverted' } ) ).toBe( false );
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 1, status: 'reverted' } ) ).toBe( false );

		// Different transfer, own grace period.
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 2, status: 'reverted' } ) ).toBe( false );
	} );
} );

describe( 'getTransferFailureMessage', () => {
	it( 'gives each outcome its own message', () => {
		const messages = [
			getTransferFailureMessage( 'reverted' ),
			getTransferFailureMessage( 'timeout' ),
			getTransferFailureMessage( 'error' ),
		];

		expect( new Set( messages ).size ).toBe( 3 );
	} );

	it( 'blames the upgrade, not the clock, when the transfer was rolled back', () => {
		expect( getTransferFailureMessage( 'reverted' ) ).toMatch( /upgrade/ );
	} );
} );
