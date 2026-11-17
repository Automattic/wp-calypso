import { isAwaitingAtomicTransfer } from '../site-atomic-transfers';
import type { AtomicTransfer, Site } from '@automattic/api-core';

const OWNER_ID = 7;

const site = ( props: Partial< Site > = {} ) =>
	( {
		slug: 'moving-site.wpcomstaging.com',
		site_owner: OWNER_ID,
		capabilities: {},
		...props,
	} ) as Site;

const transfer = ( status: AtomicTransfer[ 'status' ] ) => ( { status } ) as AtomicTransfer;

describe( 'isAwaitingAtomicTransfer', () => {
	test( 'is true for the owner while the transfer runs', () => {
		expect( isAwaitingAtomicTransfer( site(), OWNER_ID, transfer( 'pending' ) ) ).toBe( true );
		expect( isAwaitingAtomicTransfer( site(), OWNER_ID, transfer( 'active' ) ) ).toBe( true );
		expect(
			isAwaitingAtomicTransfer( site(), OWNER_ID, transfer( 'relocating_switcheroo' ) )
		).toBe( true );
	} );

	test( 'is true for the owner of an Atomic site whose capabilities haven’t arrived yet', () => {
		expect(
			isAwaitingAtomicTransfer(
				site( { is_wpcom_atomic: true } ),
				OWNER_ID,
				transfer( 'completed' )
			)
		).toBe( true );
	} );

	test( 'is false once a finished transfer left the site Simple', () => {
		expect( isAwaitingAtomicTransfer( site(), OWNER_ID, transfer( 'completed' ) ) ).toBe( false );
	} );

	test( 'is false when the transfer failed or was reverted', () => {
		expect( isAwaitingAtomicTransfer( site(), OWNER_ID, transfer( 'error' ) ) ).toBe( false );
		expect( isAwaitingAtomicTransfer( site(), OWNER_ID, transfer( 'reverted' ) ) ).toBe( false );
	} );

	test( 'is false for anyone but the site’s owner', () => {
		expect( isAwaitingAtomicTransfer( site(), 8, transfer( 'active' ) ) ).toBe( false );
		expect( isAwaitingAtomicTransfer( site(), undefined, transfer( 'active' ) ) ).toBe( false );
	} );

	test( 'is false when the owner can already manage the site', () => {
		expect(
			isAwaitingAtomicTransfer(
				site( { capabilities: { manage_options: true } as Site[ 'capabilities' ] } ),
				OWNER_ID,
				transfer( 'active' )
			)
		).toBe( false );
	} );

	test( 'is false for a deleted site, or without a transfer', () => {
		expect(
			isAwaitingAtomicTransfer( site( { is_deleted: true } ), OWNER_ID, transfer( 'active' ) )
		).toBe( false );
		expect( isAwaitingAtomicTransfer( site(), OWNER_ID, null ) ).toBe( false );
	} );
} );
