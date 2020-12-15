/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getDomainsBySite, getDomainsBySiteId, isRequestingSiteDomains } from '../selectors';
import {
	SITE_ID_FIRST as firstSiteId,
	SITE_ID_SECOND as secondSiteId,
	DOMAIN_PRIMARY,
	DOMAIN_NOT_PRIMARY,
	getStateInstance,
} from './fixture';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'calypso/lib/user', () => () => {} );

describe( 'selectors', () => {
	describe( '#getDomainsBySite()', () => {
		test( 'should return domains by site', () => {
			const state = getStateInstance();

			const firstDomains = getDomainsBySite( state, { ID: firstSiteId } );

			expect( firstDomains ).to.eql( [ DOMAIN_PRIMARY ] );

			const secondDomains = getDomainsBySite( state, { ID: secondSiteId } );

			expect( secondDomains ).to.eql( [ DOMAIN_NOT_PRIMARY ] );
		} );
	} );

	describe( '#getDomainsBySiteId()', () => {
		test( 'should return domains by site id', () => {
			const state = getStateInstance();
			const domains = getDomainsBySiteId( state, firstSiteId );
			expect( domains ).to.eql( [ DOMAIN_PRIMARY ] );
		} );
	} );

	describe( '#isRequestingSiteDomains()', () => {
		test( 'should return true if we are fetching domains', () => {
			const state = getStateInstance();

			expect( isRequestingSiteDomains( state, firstSiteId ) ).to.equal( false );
			expect( isRequestingSiteDomains( state, secondSiteId ) ).to.equal( true );
			expect( isRequestingSiteDomains( state, 'unknown' ) ).to.equal( false );
		} );
	} );
} );
