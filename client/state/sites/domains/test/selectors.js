/**
 * External dependencies
 */
import { expect } from 'chai';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getDomainsBySite, getDomainsBySiteId, isRequestingSiteDomains, getDecoratedSiteDomains } from '../selectors';
import { SITE_ID_FIRST as firstSiteId, SITE_ID_SECOND as secondSiteId, DOMAIN_PRIMARY, DOMAIN_NOT_PRIMARY, getStateInstance } from './fixture';

describe( 'selectors', () => {
	describe( '#getDomainsBySite()', () => {
		it( 'should return domains by site', () => {
			const state = getStateInstance();

			const firstDomains = getDomainsBySite( state, { ID: firstSiteId } );

			expect( firstDomains ).to.eql( [ DOMAIN_PRIMARY ] );

			const secondDomains = getDomainsBySite( state, { ID: secondSiteId } );

			expect( secondDomains ).to.eql( [ DOMAIN_NOT_PRIMARY ] );
		} );
	} );

	describe( '#getDomainsBySiteId()', () => {
		it( 'should return domains by site id', () => {
			const state = getStateInstance();
			const domains = getDomainsBySiteId( state, firstSiteId );
			expect( domains ).to.eql( [ DOMAIN_PRIMARY ] );
		} );
	} );

	describe( '#isRequestingSiteDomains()', () => {
		it( 'should return true if we are fetching domains', () => {
			const state = getStateInstance();

			expect( isRequestingSiteDomains( state, firstSiteId ) ).to.equal( false );
			expect( isRequestingSiteDomains( state, secondSiteId ) ).to.equal( true );
			expect( isRequestingSiteDomains( state, 'unknown' ) ).to.equal( false );
		} );
	} );

	describe( '#decorateSiteDomains()', () => {
		it( 'should return decorated site domains with autoRenewalMoment', () => {
			const state = getStateInstance(),
				domains = getDomainsBySiteId( state, firstSiteId );

			const decoratedDomains = getDecoratedSiteDomains( state, firstSiteId );

			const domainAutoRenewalMoment = moment( domains[ 0 ].autoRenewalDate );

			expect( decoratedDomains[ 0 ].autoRenewalMoment.date() ).to.equal( domainAutoRenewalMoment.date() );
		} );

		it( 'should return decorated site domains with registrationMoment', () => {
			const state = getStateInstance(),
				domains = getDomainsBySiteId( state, firstSiteId );

			const decoratedDomains = getDecoratedSiteDomains( state, firstSiteId );

			const domainRegistrationMoment = moment( domains[ 0 ].registrationDate );

			expect( decoratedDomains[ 0 ].registrationMoment.date() ).to.equal( domainRegistrationMoment.date() );
		} );

		it( 'should return decorated site domains with expirationMoment', () => {
			const state = getStateInstance(),
				domains = getDomainsBySiteId( state, firstSiteId );

			const decoratedDomains = getDecoratedSiteDomains( state, firstSiteId );

			const domainExpirationMoment = moment( domains[ 0 ].expiry );

			expect( decoratedDomains[ 0 ].expirationMoment.date() ).to.equal( domainExpirationMoment.date() );
		} );
	} );
} );
