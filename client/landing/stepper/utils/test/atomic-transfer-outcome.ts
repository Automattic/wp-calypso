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

	it( 'leaves a transfer that was already reverted on arrival to the caller timeout', () => {
		const isRevertOfThisTransfer = createRevertedTransferWatcher();

		// Indistinguishable from stale history without an id to correlate against.
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 9, status: 'reverting' } ) ).toBe(
			false
		);
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 9, status: 'reverted' } ) ).toBe( false );
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 9, status: 'reverted' } ) ).toBe( false );
	} );

	it( 'never claims a stale reverted transfer, however long it stays latest', () => {
		const isRevertOfThisTransfer = createRevertedTransferWatcher();

		for ( let poll = 0; poll < 20; poll++ ) {
			expect( isRevertOfThisTransfer( { atomic_transfer_id: 1, status: 'reverted' } ) ).toBe(
				false
			);
		}

		// The real transfer arrives late and still runs normally.
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 2, status: 'pending' } ) ).toBe( false );
		expect( isRevertOfThisTransfer( { atomic_transfer_id: 2, status: 'reverted' } ) ).toBe( true );
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
