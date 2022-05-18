import { getDomainsBySite, getDomainsBySiteId, isRequestingSiteDomains } from '../selectors';
import {
	SITE_ID_FIRST as firstSiteId,
	SITE_ID_SECOND as secondSiteId,
	DOMAIN_PRIMARY,
	DOMAIN_NOT_PRIMARY,
	getStateInstance,
} from './fixture';

describe( 'selectors', () => {
	describe( '#getDomainsBySite()', () => {
		test( 'should return domains by site', () => {
			const state = getStateInstance();

			const firstDomains = getDomainsBySite( state, { ID: firstSiteId } );

			expect( firstDomains ).toEqual( [ DOMAIN_PRIMARY ] );

			const secondDomains = getDomainsBySite( state, { ID: secondSiteId } );

			expect( secondDomains ).toEqual( [ DOMAIN_NOT_PRIMARY ] );
		} );
	} );

	describe( '#getDomainsBySiteId()', () => {
		test( 'should return domains by site id', () => {
			const state = getStateInstance();
			const domains = getDomainsBySiteId( state, firstSiteId );
			expect( domains ).toEqual( [ DOMAIN_PRIMARY ] );
		} );
	} );

	describe( '#isRequestingSiteDomains()', () => {
		test( 'should return true if we are fetching domains', () => {
			const state = getStateInstance();

			expect( isRequestingSiteDomains( state, firstSiteId ) ).toEqual( false );
			expect( isRequestingSiteDomains( state, secondSiteId ) ).toEqual( true );
			expect( isRequestingSiteDomains( state, 'unknown' ) ).toEqual( false );
		} );
	} );
} );
