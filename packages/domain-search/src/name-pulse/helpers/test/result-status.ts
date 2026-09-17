import {
	mergeResultUpdate,
	needsAvailabilityCheck,
	NamePulseDomainStatus,
	type NamePulseDomainResult,
} from '..';

const row = ( overrides: Partial< NamePulseDomainResult > = {} ): NamePulseDomainResult => ( {
	domain_name: 'test.com',
	suffix: 'com',
	status: NamePulseDomainStatus.WAITING,
	source: 'exact',
	...overrides,
} );

describe( 'needsAvailabilityCheck', () => {
	it( 'is true for WAITING and UNKNOWN only', () => {
		expect( needsAvailabilityCheck( NamePulseDomainStatus.WAITING ) ).toBe( true );
		expect( needsAvailabilityCheck( NamePulseDomainStatus.UNKNOWN ) ).toBe( true );
		expect( needsAvailabilityCheck( NamePulseDomainStatus.AVAILABLE ) ).toBe( false );
		expect( needsAvailabilityCheck( NamePulseDomainStatus.TAKEN ) ).toBe( false );
	} );
} );

describe( 'mergeResultUpdate', () => {
	it( 'applies a bulk verdict to a waiting row', () => {
		const merged = mergeResultUpdate( row(), {
			domain_name: 'test.com',
			status: NamePulseDomainStatus.AVAILABLE,
			cost: '$22.00',
		} );

		expect( merged.status ).toBe( NamePulseDomainStatus.AVAILABLE );
		expect( merged.cost ).toBe( '$22.00' );
	} );

	it( 'keeps a real-time verdict when a bulk update arrives later', () => {
		const existing = row( { status: NamePulseDomainStatus.TAKEN, is_realtime: true } );

		expect(
			mergeResultUpdate( existing, {
				domain_name: 'test.com',
				status: NamePulseDomainStatus.AVAILABLE,
			} )
		).toBe( existing );
	} );

	it( 'ignores a late UNKNOWN once a verdict has landed', () => {
		const existing = row( { status: NamePulseDomainStatus.AVAILABLE, cost: '$22.00' } );

		expect(
			mergeResultUpdate( existing, {
				domain_name: 'test.com',
				status: NamePulseDomainStatus.UNKNOWN,
			} )
		).toBe( existing );
	} );
} );
