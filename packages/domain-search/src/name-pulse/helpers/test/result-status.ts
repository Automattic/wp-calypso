import {
	applyNamePulseVerdict,
	mergeNamePulseVerdict,
	NamePulseDomainStatus,
	type NamePulseDomainResult,
	type NamePulseVerdict,
} from '..';

const row = ( overrides: Partial< NamePulseDomainResult > = {} ): NamePulseDomainResult => ( {
	domain_name: 'test.com',
	suffix: 'com',
	status: NamePulseDomainStatus.WAITING,
	source: 'exact',
	...overrides,
} );

describe( 'mergeNamePulseVerdict', () => {
	it( 'never lets a bulk verdict overwrite a real-time one', () => {
		const realtime: NamePulseVerdict = { status: NamePulseDomainStatus.TAKEN, is_realtime: true };
		const bulk: NamePulseVerdict = { status: NamePulseDomainStatus.AVAILABLE, cost: '$22.00' };

		expect( mergeNamePulseVerdict( realtime, bulk ) ).toBe( realtime );
		expect( mergeNamePulseVerdict( bulk, realtime ) ).toBe( realtime );
		expect( mergeNamePulseVerdict( undefined, bulk ) ).toBe( bulk );
	} );
} );

describe( 'applyNamePulseVerdict', () => {
	it( 'keeps the row WAITING without an entry, marks a failed check UNKNOWN and spreads a verdict', () => {
		const waiting = row();

		expect( applyNamePulseVerdict( waiting, undefined ) ).toBe( waiting );
		expect( applyNamePulseVerdict( waiting, { isUnknown: false } ) ).toBe( waiting );
		expect( applyNamePulseVerdict( waiting, { isUnknown: true } ).status ).toBe(
			NamePulseDomainStatus.UNKNOWN
		);
		expect(
			applyNamePulseVerdict( waiting, {
				verdict: { status: NamePulseDomainStatus.AVAILABLE, cost: '$22.00' },
				isUnknown: false,
			} )
		).toEqual( row( { status: NamePulseDomainStatus.AVAILABLE, cost: '$22.00' } ) );
	} );
} );
