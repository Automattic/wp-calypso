import { DomainAvailabilityStatus } from '@automattic/api-core';
import { getNamePulseExactMatch, getNamePulseExactTarget, getResultsLayout } from '..';
import { buildAvailability } from '../../../test-helpers/factories/availability';

const fqdn = { baseName: 'icecream', tld: 'blog', fullDomain: 'icecream.blog' };

describe( 'getNamePulseExactMatch', () => {
	it( 'has no card when the query is not a domain', () => {
		expect( getNamePulseExactMatch( undefined, undefined, false ) ).toBeNull();
	} );

	it( 'holds the card while the typed domain is being checked', () => {
		expect( getNamePulseExactMatch( fqdn, undefined, false ) ).toEqual( {
			domainName: 'icecream.blog',
			tld: 'blog',
		} );
	} );

	it( 'ignores a verdict for another domain', () => {
		const availability = buildAvailability( { domain_name: 'icecream.com' } );

		expect( getNamePulseExactMatch( fqdn, availability, false ) ).toEqual( {
			domainName: 'icecream.blog',
			tld: 'blog',
		} );
	} );

	it( 'fills the card with the real-time check of an available domain', () => {
		const availability = buildAvailability( {
			domain_name: 'icecream.blog',
			tld: 'blog',
			cost: '$22.00',
			raw_price: 22,
		} );

		expect( getNamePulseExactMatch( fqdn, availability, false ) ).toEqual( {
			domainName: 'icecream.blog',
			tld: 'blog',
			availability,
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
			)?.availability
		).toBeDefined();
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

describe( 'getNamePulseExactTarget', () => {
	const tlds = [ 'com', 'net', 'blog', 'app' ];
	const layoutFor = ( query: string ) => getResultsLayout( query, tlds );

	it( 'is the typed domain, whatever the filter', () => {
		expect( getNamePulseExactTarget( layoutFor( 'icecream.blog' ), [ 'com' ] ) ).toEqual( fqdn );
	} );

	it( 'is the name with the one ending the filter allows', () => {
		expect( getNamePulseExactTarget( layoutFor( 'ice cream' ), [ 'com' ] ) ).toEqual( {
			baseName: 'icecream',
			tld: 'com',
			fullDomain: 'icecream.com',
		} );
	} );

	it( 'splits a name that ends in the filtered ending, like its grid row', () => {
		expect( getNamePulseExactTarget( layoutFor( 'myapp' ), [ 'app' ] )?.fullDomain ).toBe(
			'my.app'
		);
	} );

	it.each( [
		[ 'no ending is chosen', 'icecream', [] ],
		[ 'several endings are chosen', 'icecream', [ 'com', 'net' ] ],
		[ 'the query has no exact grid', 'a blog about ice cream', [ 'com' ] ],
	] )( 'is unset when %s', ( _, query, selectedTlds ) => {
		expect( getNamePulseExactTarget( layoutFor( query ), selectedTlds ) ).toBeUndefined();
	} );
} );
