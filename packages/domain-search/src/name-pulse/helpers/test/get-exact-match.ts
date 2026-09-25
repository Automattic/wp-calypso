import { DomainAvailabilityStatus } from '@automattic/api-core';
import { getNamePulseExactMatch, NamePulseDomainStatus } from '..';
import { buildAvailability } from '../../../test-helpers/factories/availability';

const fqdn = { baseName: 'icecream', tld: 'blog', fullDomain: 'icecream.blog' };

describe( 'getNamePulseExactMatch', () => {
	it( 'has no card when the query is not a domain', () => {
		expect( getNamePulseExactMatch( undefined, undefined, false ) ).toBeNull();
	} );

	it( 'holds the card while the typed domain is being checked', () => {
		expect( getNamePulseExactMatch( fqdn, undefined, false ) ).toEqual( {
			domainName: 'icecream.blog',
		} );
	} );

	it( 'ignores a verdict for another domain', () => {
		const availability = buildAvailability( { domain_name: 'icecream.com' } );

		expect( getNamePulseExactMatch( fqdn, availability, false ) ).toEqual( {
			domainName: 'icecream.blog',
		} );
	} );

	it( 'fills the card with the real-time price of an available domain', () => {
		const availability = buildAvailability( {
			domain_name: 'icecream.blog',
			tld: 'blog',
			cost: '$22.00',
			raw_price: 22,
		} );

		expect( getNamePulseExactMatch( fqdn, availability, false ) ).toEqual( {
			domainName: 'icecream.blog',
			result: expect.objectContaining( {
				domain_name: 'icecream.blog',
				suffix: 'blog',
				source: 'exact',
				status: NamePulseDomainStatus.AVAILABLE,
				cost: '$22.00',
				raw_price: 22,
				is_realtime: true,
			} ),
		} );
	} );

	it( 'features a premium name only on a TLD whose premiums we sell', () => {
		const premium = {
			domain_name: 'icecream.blog',
			status: DomainAvailabilityStatus.AVAILABLE_PREMIUM,
		};

		expect(
			getNamePulseExactMatch(
				fqdn,
				buildAvailability( { ...premium, is_supported_premium_domain: true } ),
				false
			)?.result
		).toEqual( expect.objectContaining( { is_premium: true } ) );
		expect( getNamePulseExactMatch( fqdn, buildAvailability( premium ), false ) ).toBeNull();
	} );

	it.each( [
		DomainAvailabilityStatus.TRANSFERRABLE,
		DomainAvailabilityStatus.REGISTERED_OTHER_SITE_SAME_USER,
		DomainAvailabilityStatus.TLD_NOT_SUPPORTED,
	] )( 'has no card for a %s domain', ( status ) => {
		const availability = buildAvailability( { domain_name: 'icecream.blog', status } );

		expect( getNamePulseExactMatch( fqdn, availability, false ) ).toBeNull();
	} );

	it( 'has no card when the check fails', () => {
		expect( getNamePulseExactMatch( fqdn, undefined, true ) ).toBeNull();
	} );
} );
