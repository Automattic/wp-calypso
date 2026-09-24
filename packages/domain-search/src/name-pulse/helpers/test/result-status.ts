import { DomainAvailabilityStatus } from '@automattic/api-core';
import {
	applyNamePulseVerdict,
	mergeNamePulseVerdict,
	NamePulseDomainStatus,
	toNamePulseRealtimeVerdict,
	type NamePulseDomainResult,
	type NamePulseVerdict,
} from '..';
import { buildAvailability } from '../../../test-helpers/factories/availability';

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

describe( 'toNamePulseRealtimeVerdict', () => {
	it( 'carries the registry price of a premium name its TLD can sell', () => {
		expect(
			toNamePulseRealtimeVerdict(
				buildAvailability( {
					status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
					is_supported_premium_domain: true,
					cost: '$3,500.00',
					raw_price: 3500,
				} )
			)
		).toEqual( {
			status: NamePulseDomainStatus.AVAILABLE,
			cost: '$3,500.00',
			raw_price: 3500,
			sale_cost: undefined,
			currency_code: 'USD',
			is_premium: true,
			is_realtime: true,
		} );
	} );

	it( 'takes a premium name its TLD cannot sell off the market', () => {
		const verdict = toNamePulseRealtimeVerdict(
			buildAvailability( {
				status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
				is_supported_premium_domain: false,
				cost: '$3,500.00',
			} )
		);

		expect( verdict.status ).toBe( NamePulseDomainStatus.TAKEN );
		expect( verdict.cost ).toBeUndefined();
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
