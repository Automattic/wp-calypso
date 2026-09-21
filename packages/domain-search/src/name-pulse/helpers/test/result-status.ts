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
	it( 'never lets a bulk verdict overwrite a real-time one, nor a late UNKNOWN overwrite a verdict', () => {
		const realtime = row( { status: NamePulseDomainStatus.TAKEN, is_realtime: true } );
		const verdict = row( { status: NamePulseDomainStatus.AVAILABLE, cost: '$22.00' } );

		expect(
			mergeResultUpdate( realtime, {
				domain_name: 'test.com',
				status: NamePulseDomainStatus.AVAILABLE,
			} )
		).toBe( realtime );
		expect(
			mergeResultUpdate( verdict, {
				domain_name: 'test.com',
				status: NamePulseDomainStatus.UNKNOWN,
			} )
		).toBe( verdict );
	} );
} );
